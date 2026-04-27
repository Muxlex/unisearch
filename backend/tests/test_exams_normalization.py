import unittest
from unittest.mock import patch
from app.services import exams as exams_service

class ExamNormalizationTests(unittest.TestCase):
    def test_sat_normalization_uses_anchor_percentiles(self):
        self.assertAlmostEqual(50.0, float(exams_service.normalize_exam_score("SAT", 1010) or 0.0), places=4)
        self.assertAlmostEqual(95.0, float(exams_service.normalize_exam_score("SAT", 1450) or 0.0), places=4)

    def test_unt_and_ent_share_same_normalization(self):
        unt = exams_service.normalize_exam_score("UNT", 120)
        ent = exams_service.normalize_exam_score("ENT", 120)
        self.assertAlmostEqual(95.0, float(unt or 0.0), places=4)
        self.assertAlmostEqual(float(unt or 0.0), float(ent or 0.0), places=4)

    def test_ege_normalization_uses_shared_anchor_table(self):
        self.assertAlmostEqual(50.0, float(exams_service.normalize_exam_score("EGE", 55) or 0.0), places=4)
        self.assertAlmostEqual(95.0, float(exams_service.normalize_exam_score("EGE", 88) or 0.0), places=4)

    def test_hkdse_weighted_total_uses_min_max_normalization(self):
        self.assertAlmostEqual(90.7513, float(exams_service.normalize_exam_score("HKDSE_WEIGHTED_TOTAL", 42.88) or 0.0), places=3)

    def test_a_level_grades_normalize_from_internal_points(self):
        self.assertAlmostEqual(50.0, float(exams_service.normalize_exam_score("A_LEVEL_CERT", 12) or 0.0), places=4)
        self.assertAlmostEqual(95.0, float(exams_service.normalize_exam_score("A_LEVEL_CERT", 17) or 0.0), places=4)
        self.assertTrue(exams_service.exam_supports_percentile_normalization("A_LEVEL_CERT"))

    def test_normalize_exam_score_edge_cases(self):
        # Invalid exam key
        self.assertIsNone(exams_service.normalize_exam_score("INVALID_EXAM", 100))

        # None score
        self.assertIsNone(exams_service.normalize_exam_score("SAT", None))

        # Score below min should clamp to 0 (since min is 400 for SAT, 300 should be clamped to 0)
        self.assertEqual(0.0, exams_service.normalize_exam_score("SAT", 300))

        # Score above max should clamp to 100
        self.assertEqual(100.0, exams_service.normalize_exam_score("SAT", 1700))

        # Score above p50 but below top5_min
        self.assertAlmostEqual(72.5, float(exams_service.normalize_exam_score("SAT", 1230) or 0.0), places=1) # Halfway between 1010 (50th) and 1450 (95th)

        # Score above top5_min but below max
        self.assertAlmostEqual(97.5, float(exams_service.normalize_exam_score("SAT", 1525) or 0.0), places=1) # Halfway between 1450 (95th) and 1600 (100th)

        # Non-numeric string should return None
        self.assertIsNone(exams_service.normalize_exam_score("SAT", "not_a_number"))

        # Test min/max normalization fallback (using HKDSE_WEIGHTED_TOTAL)
        # Score below min
        self.assertEqual(0.0, exams_service.normalize_exam_score("HKDSE_WEIGHTED_TOTAL", -5.0))
        # Score above max
        self.assertEqual(100.0, exams_service.normalize_exam_score("HKDSE_WEIGHTED_TOTAL", 50.0))
        # Zero score
        self.assertEqual(0.0, exams_service.normalize_exam_score("HKDSE_WEIGHTED_TOTAL", 0.0))
        # Max score
        self.assertEqual(100.0, exams_service.normalize_exam_score("HKDSE_WEIGHTED_TOTAL", 47.25))

    def test_normalize_exam_score_non_numeric_and_flag(self):
        # Boolean type exam (e.g., OSSD_CERT)
        self.assertIsNone(exams_service.normalize_exam_score("OSSD_CERT", 1))

    @patch.dict(exams_service.EXAMS_CONFIG, {"TEST_EXAM_NO_MINMAX": {"input_mode": "number", "type": "float"}})
    def test_normalize_exam_score_missing_min_max(self):
        self.assertIsNone(exams_service.normalize_exam_score("TEST_EXAM_NO_MINMAX", 50))

    @patch.dict(exams_service.EXAMS_CONFIG, {"TEST_EXAM_MIN_EQ_MAX": {"input_mode": "number", "type": "float", "min": 100, "max": 100}})
    def test_normalize_exam_score_min_eq_max(self):
        self.assertIsNone(exams_service.normalize_exam_score("TEST_EXAM_MIN_EQ_MAX", 100))

    @patch.dict(exams_service.EXAMS_CONFIG, {
        "TEST_EXAM_CUSTOM_PERCENTILES": {
            "input_mode": "number",
            "type": "float",
            "min": 0,
            "max": 100,
            "normalization": {
                "kind": "anchor_percentile",
                "p50": 60,
                "top5_min": 90,
                "p50_percentile": 60, # Override default 50
                "top5_percentile": 98  # Override default 95
            }
        }
    })
    def test_normalize_exam_score_custom_percentiles(self):
        # Custom p50 and top5_percentile logic

        # Below p50
        self.assertAlmostEqual(30.0, exams_service.normalize_exam_score("TEST_EXAM_CUSTOM_PERCENTILES", 30), places=1) # (30/60) * 60 = 30

        # Exactly p50
        self.assertAlmostEqual(60.0, exams_service.normalize_exam_score("TEST_EXAM_CUSTOM_PERCENTILES", 60), places=1)

        # Between p50 and top5_min
        self.assertAlmostEqual(79.0, exams_service.normalize_exam_score("TEST_EXAM_CUSTOM_PERCENTILES", 75), places=1) # 60 + ((75-60)/(90-60))*(98-60) = 60 + 0.5 * 38 = 79

        # Exactly top5_min
        self.assertAlmostEqual(98.0, exams_service.normalize_exam_score("TEST_EXAM_CUSTOM_PERCENTILES", 90), places=1)

        # Above top5_min
        self.assertAlmostEqual(99.0, exams_service.normalize_exam_score("TEST_EXAM_CUSTOM_PERCENTILES", 95), places=1) # 98 + ((95-90)/(100-90))*(100-98) = 98 + 0.5 * 2 = 99


    def test_normalize_exam_score_invalid_grade_combo(self):
        # Grade combo that fails to coerce
        self.assertIsNone(exams_service.normalize_exam_score("A_LEVEL_CERT", "invalid_combo_string"))

    def test_normalize_exam_score_invalid_grade_fallback(self):
        # Grade combo that fails to coerce but is valid numeric string
        # A_LEVEL_CERT requires a breakdown structure or special raw parsing
        # If we just pass a number it fails coercion but falls back to numeric parse
        self.assertAlmostEqual(41.6667, exams_service.normalize_exam_score("A_LEVEL_CERT", "10") or 0.0, places=4)

if __name__ == "__main__":
    unittest.main()
