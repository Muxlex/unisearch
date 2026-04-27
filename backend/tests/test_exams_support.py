import unittest
from decimal import Decimal
from parameterized import parameterized
from app.services.exam_support import validate_numeric_score

class TestValidateNumericScore(unittest.TestCase):
    def setUp(self):
        self.cfg_standard = {"min": 0, "max": 100}
        self.cfg_with_step = {"min": 0, "max": 100, "step": 0.5}

    @parameterized.expand([
        ("50", 50.0),
        ("75.5", 75.5),
        ("0", 0.0),
        ("100", 100.0),
        (25, 25.0),
        (33.3, 33.3)
    ])
    def test_valid_scores(self, input_val, expected):
        self.assertEqual(validate_numeric_score("TEST_EXAM", self.cfg_standard, input_val), expected)

    @parameterized.expand([
        (None,),
        (" ",),
        ("",)
    ])
    def test_missing_score(self, input_val):
        with self.assertRaisesRegex(ValueError, "score is required"):
            validate_numeric_score("TEST_EXAM", self.cfg_standard, input_val)

    @parameterized.expand([
        ("abc",),
        ("12..3",),
        ("1.2.3",),
        ("NaN",),
        ("Infinity",),
        ("-Infinity",),
        ("inf",)
    ])
    def test_invalid_format(self, input_val):
        with self.assertRaisesRegex(ValueError, "Invalid score format", msg=f"Failed on {input_val}"):
            validate_numeric_score("TEST_EXAM", self.cfg_standard, input_val)

    @parameterized.expand([
        ("-1",),
        ("101",),
        (-0.001,),
        (100.001,)
    ])
    def test_out_of_bounds(self, input_val):
        with self.assertRaisesRegex(ValueError, "Score must be between"):
            validate_numeric_score("TEST_EXAM", self.cfg_standard, input_val)

    @parameterized.expand([
        ("75.25",),
        ("33.33",)
    ])
    def test_invalid_step(self, input_val):
        with self.assertRaisesRegex(ValueError, "Score must follow step"):
            validate_numeric_score("TEST_EXAM", self.cfg_with_step, input_val)

if __name__ == "__main__":
    unittest.main()
