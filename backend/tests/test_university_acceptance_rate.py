import unittest
from backend.app.services.universities import _get_university_acceptance_rate

class TestUniversityAcceptanceRate(unittest.TestCase):
    def test_direct_acceptance_rate(self):
        u = {
            "academics": {
                "acceptance_rate_percent": 15.5
            }
        }
        self.assertEqual(_get_university_acceptance_rate(u), 15.5)

    def test_direct_acceptance_rate_string(self):
        u = {
            "academics": {
                "acceptance_rate_percent": "20.0"
            }
        }
        self.assertEqual(_get_university_acceptance_rate(u), 20.0)

    def test_programs_average(self):
        u = {
            "academics": {
                "programs": [
                    {"acceptance_rate_percent": 10.0},
                    {"acceptance_rate_percent": "30.0"}
                ]
            }
        }
        self.assertEqual(_get_university_acceptance_rate(u), 20.0)

    def test_programs_average_with_missing(self):
        u = {
            "academics": {
                "programs": [
                    {"acceptance_rate_percent": 15.0},
                    {},  # no rate
                    {"acceptance_rate_percent": 25.0}
                ]
            }
        }
        self.assertEqual(_get_university_acceptance_rate(u), 20.0)

    def test_no_academics(self):
        u = {}
        self.assertIsNone(_get_university_acceptance_rate(u))

    def test_empty_programs(self):
        u = {
            "academics": {
                "programs": []
            }
        }
        self.assertIsNone(_get_university_acceptance_rate(u))

    def test_programs_no_rates(self):
        u = {
            "academics": {
                "programs": [
                    {"name": "CS"},
                    {"name": "Math"}
                ]
            }
        }
        self.assertIsNone(_get_university_acceptance_rate(u))

    def test_direct_none(self):
        u = {
            "academics": {
                "acceptance_rate_percent": None
            }
        }
        self.assertIsNone(_get_university_acceptance_rate(u))

if __name__ == '__main__':
    unittest.main()
