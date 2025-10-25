"""districts

Revision ID: 360fb2fa1e6f
Revises: 357c998aaf00
Create Date: 2025-10-25 00:13:33.738166

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session

from src.models.district import District
from src.models.district_aggregate import DistrictAggregate
from src.models.green_places import GreenPlaces
from src.models.digital_noise import DigitalNoise
from src.models.social_availability import SocialAvailability
from src.models.life_balance import LifeBalance
from src.models.safety import Safety
from src.models.social_life import SocialLife
from src.models.district_rhythm import DistrictRhythm


# revision identifiers, used by Alembic.
revision: str = '360fb2fa1e6f'
down_revision: Union[str, None] = '357c998aaf00'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


districts_data = [
  {
    "name": "śródmieście",
    "code": "srodmiescie",
    "social_life": {"rows": 361, "score": 5.8916442118257715, "normalized": 99.1},
    "district_rhythm": {"peak_hour": 13, "activity_amplitude": 99.99999999230769, "avg_activity": 49.679487175665685, "normalized": 74.8},
    "green_places": {"total_obs": 361, "green_obs": 9, "unique_users": 53, "green_ratio": 0.025, "green_life_score": 2.5},
    "digital_noise": {"total_obs": 361, "unique_users": 53, "avg_tech_weight": 0.9290858725761773, "noise_index_raw": 6.3283018867924525, "digital_noise_score": 44.3},
    "social_availability": {"active_hours": 20, "social_availability_score": 83.3},
    "life_balance": {"total_obs": 361, "unique_users": 53, "avg_tech_weight": 0.9290858725761773, "noise_index_raw": 6.3283018867924525, "digital_noise_score": 44.3, "presence_ratio": 0.14681440443213298, "inverse_noise": 55.7, "life_balance_raw": 65.61333333333333, "life_balance_score": 70.7},
    "safety": {"incidents": 410, "incident_norm": 1.0, "safety_index": 0.0, "safety_level": "High risk"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 100.0, "unique_users": 24},
      {"daypart": "NOON", "score_0_100": 100.0, "unique_users": 35},
      {"daypart": "EVENING", "score_0_100": 100.0, "unique_users": 32}
    ]
  },
  {
    "name": "wola",
    "code": "wola",
    "social_life": {"rows": 374, "score": 5.926926025970411, "normalized": 100.0},
    "district_rhythm": {"peak_hour": 19, "activity_amplitude": 99.99999999166667, "avg_activity": 42.01388888538773, "normalized": 71.0},
    "green_places": {"total_obs": 374, "green_obs": 3, "unique_users": 34, "green_ratio": 0.008021390374331552, "green_life_score": 0.8},
    "digital_noise": {"total_obs": 374, "unique_users": 34, "avg_tech_weight": 0.9719251336898396, "noise_index_raw": 10.691176470588236, "digital_noise_score": 82.4},
    "social_availability": {"active_hours": 23, "social_availability_score": 63.0},
    "life_balance": {"total_obs": 374, "unique_users": 34, "avg_tech_weight": 0.9719251336898396, "noise_index_raw": 10.691176470588236, "digital_noise_score": 82.4, "presence_ratio": 0.09090909090909091, "inverse_noise": 17.6, "life_balance_raw": 17.04, "life_balance_score": 15.5},
    "safety": {"incidents": 260, "incident_norm": 0.6103896103896104, "safety_index": 39.0, "safety_level": "High risk"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 87.0, "unique_users": 21},
      {"daypart": "NOON", "score_0_100": 75.0, "unique_users": 27},
      {"daypart": "EVENING", "score_0_100": 58.1, "unique_users": 19}
    ]
  },
  {
    "name": "praga południe",
    "code": "praga_poludnie",
    "social_life": {"rows": 285, "score": 5.655991810819852, "normalized": 93.4},
    "district_rhythm": {"peak_hour": 6, "activity_amplitude": 99.99999998999999, "avg_activity": 43.333333329, "normalized": 71.7},
    "green_places": {"total_obs": 285, "green_obs": 12, "unique_users": 32, "green_ratio": 0.042, "green_life_score": 4.2},
    "digital_noise": {"total_obs": 285, "unique_users": 32, "avg_tech_weight": 0.9396491228070176, "noise_index_raw": 8.36875, "digital_noise_score": 62.1},
    "social_availability": {"active_hours": 23, "social_availability_score": 44.0},
    "life_balance": {"total_obs": 285, "unique_users": 32, "avg_tech_weight": 0.9396491228070176, "noise_index_raw": 8.36875, "digital_noise_score": 62.1, "presence_ratio": 0.11228070175438597, "inverse_noise": 37.9, "life_balance_raw": 31.826666666666664, "life_balance_score": 32.3},
    "safety": {"incidents": 230, "incident_norm": 0.5324675324675324, "safety_index": 46.8, "safety_level": "High risk"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 87.0, "unique_users": 21},
      {"daypart": "NOON", "score_0_100": 43.8, "unique_users": 17},
      {"daypart": "EVENING", "score_0_100": 54.8, "unique_users": 18}
    ]
  },
  {
    "name": "ursynów",
    "code": "ursynow",
    "social_life": {"rows": 275, "score": 5.62040086571715, "normalized": 92.6},
    "district_rhythm": {"peak_hour": 6, "activity_amplitude": 99.99999998888889, "avg_activity": 57.40740740102881, "normalized": 78.7},
    "green_places": {"total_obs": 276, "green_obs": 18, "unique_users": 21, "green_ratio": 0.065, "green_life_score": 6.5},
    "digital_noise": {"total_obs": 275, "unique_users": 21, "avg_tech_weight": 0.9709090909090908, "noise_index_raw": 12.714285714285714, "digital_noise_score": 100.0},
    "social_availability": {"active_hours": 21, "social_availability_score": 78.9},
    "life_balance": {"total_obs": 275, "unique_users": 21, "avg_tech_weight": 0.9709090909090908, "noise_index_raw": 12.714285714285714, "digital_noise_score": 100.0, "presence_ratio": 0.07636363636363637, "inverse_noise": 0.0, "life_balance_raw": 3.3333333333333335, "life_balance_score": 0.0},
    "safety": {"incidents": 95, "incident_norm": 0.18181818181818182, "safety_index": 81.8, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 69.6, "unique_users": 17},
      {"daypart": "NOON", "score_0_100": 40.6, "unique_users": 16},
      {"daypart": "EVENING", "score_0_100": 38.7, "unique_users": 13}
    ]
  },
  {
    "name": "białołęka",
    "code": "bialoleka",
    "social_life": {"rows": 256, "score": 5.54907608489522, "normalized": 90.9},
    "district_rhythm": {"peak_hour": 9, "activity_amplitude": 99.99999998571428, "avg_activity": 55.952380944387755, "normalized": 78.0},
    "green_places": {"total_obs": 256, "green_obs": 52, "unique_users": 30, "green_ratio": 0.203125, "green_life_score": 20.3},
    "digital_noise": {"total_obs": 256, "unique_users": 30, "avg_tech_weight": 0.984375, "noise_index_raw": 8.4, "digital_noise_score": 62.4},
    "social_availability": {"active_hours": 23, "social_availability_score": 19.0},
    "life_balance": {"total_obs": 256, "unique_users": 30, "avg_tech_weight": 0.984375, "noise_index_raw": 8.4, "digital_noise_score": 62.4, "presence_ratio": 0.1171875, "inverse_noise": 37.6, "life_balance_raw": 38.373333333333335, "life_balance_score": 39.8},
    "safety": {"incidents": 90, "incident_norm": 0.16883116883116883, "safety_index": 83.1, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 69.6, "unique_users": 17},
      {"daypart": "NOON", "score_0_100": 68.8, "unique_users": 25},
      {"daypart": "EVENING", "score_0_100": 38.7, "unique_users": 13}
    ]
  },
  {
    "name": "bemowo",
    "code": "bemowo",
    "social_life": {"rows": 147, "score": 4.997212273764115, "normalized": 77.5},
    "district_rhythm": {"peak_hour": 7, "activity_amplitude": 99.99999998, "avg_activity": 50.90909089890909, "normalized": 75.5},
    "green_places": {"total_obs": 147, "green_obs": 10, "unique_users": 19, "green_ratio": 0.07, "green_life_score": 7.0},
    "digital_noise": {"total_obs": 147, "unique_users": 19, "avg_tech_weight": 0.9925170068027211, "noise_index_raw": 7.678947368421053, "digital_noise_score": 56.1},
    "social_availability": {"active_hours": 19, "social_availability_score": 77.8},
    "life_balance": {"total_obs": 147, "unique_users": 19, "avg_tech_weight": 0.9925170068027211, "noise_index_raw": 7.678947368421053, "digital_noise_score": 56.1, "presence_ratio": 0.1292517006802721, "inverse_noise": 43.9, "life_balance_raw": 54.226666666666674, "life_balance_score": 57.7},
    "safety": {"incidents": 100, "incident_norm": 0.19480519480519481, "safety_index": 80.5, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 47.8, "unique_users": 12},
      {"daypart": "NOON", "score_0_100": 25.0, "unique_users": 11},
      {"daypart": "EVENING", "score_0_100": 29.0, "unique_users": 10}
    ]
  },
  {
    "name": "bielany",
    "code": "bielany",
    "social_life": {"rows": 177, "score": 5.181783550292085, "normalized": 82.0},
    "district_rhythm": {"peak_hour": 9, "activity_amplitude": 99.99999998888889, "avg_activity": 39.13043477826087, "normalized": 69.6},
    "green_places": {"total_obs": 177, "green_obs": 30, "unique_users": 22, "green_ratio": 0.17, "green_life_score": 17.0},
    "digital_noise": {"total_obs": 177, "unique_users": 22, "avg_tech_weight": 0.993220338983051, "noise_index_raw": 7.990909090909091, "digital_noise_score": 58.8},
    "social_availability": {"active_hours": 14, "social_availability_score": 50.0},
    "life_balance": {"total_obs": 177, "unique_users": 22, "avg_tech_weight": 0.993220338983051, "noise_index_raw": 7.990909090909091, "digital_noise_score": 58.8, "presence_ratio": 0.12429378531073447, "inverse_noise": 41.2, "life_balance_raw": 46.48, "life_balance_score": 48.9},
    "safety": {"incidents": 120, "incident_norm": 0.24675324675324675, "safety_index": 75.3, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 52.2, "unique_users": 13},
      {"daypart": "NOON", "score_0_100": 46.9, "unique_users": 18},
      {"daypart": "EVENING", "score_0_100": 29.0, "unique_users": 10}
    ]
  },
  {
    "name": "targówek",
    "code": "targowek",
    "social_life": {"rows": 114, "score": 4.74493212836325, "normalized": 71.4},
    "district_rhythm": {"peak_hour": 17, "activity_amplitude": 99.99999998, "avg_activity": 40.90909090090909, "normalized": 70.5},
    "green_places": {"total_obs": 114, "green_obs": 4, "unique_users": 17, "green_ratio": 0.03508771929824561, "green_life_score": 3.5},
    "digital_noise": {"total_obs": 114, "unique_users": 17, "avg_tech_weight": 1.0, "noise_index_raw": 6.705882352941177, "digital_noise_score": 47.6},
    "social_availability": {"active_hours": 17, "social_availability_score": 66.7},
    "life_balance": {"total_obs": 114, "unique_users": 17, "avg_tech_weight": 1.0, "noise_index_raw": 6.705882352941177, "digital_noise_score": 47.6, "presence_ratio": 0.14912280701754385, "inverse_noise": 52.4, "life_balance_raw": 70.96, "life_balance_score": 76.7},
    "safety": {"incidents": 85, "incident_norm": 0.15584415584415584, "safety_index": 84.4, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 26.1, "unique_users": 7},
      {"daypart": "NOON", "score_0_100": 18.8, "unique_users": 9},
      {"daypart": "EVENING", "score_0_100": 29.0, "unique_users": 10}
    ]
  },
  {
    "name": "wawer",
    "code": "wawer",
    "social_life": {"rows": 208, "score": 5.342334251964811, "normalized": 85.9},
    "district_rhythm": {"peak_hour": 5, "activity_amplitude": 99.99999998, "avg_activity": 39.16666665883333, "normalized": 69.6},
    "green_places": {"total_obs": 208, "green_obs": 25, "unique_users": 16, "green_ratio": 0.12, "green_life_score": 12.0},
    "digital_noise": {"total_obs": 208, "unique_users": 16, "avg_tech_weight": 0.8846153846153846, "noise_index_raw": 11.5, "digital_noise_score": 89.4},
    "social_availability": {"active_hours": 19, "social_availability_score": 22.8},
    "life_balance": {"total_obs": 208, "unique_users": 16, "avg_tech_weight": 0.8846153846153846, "noise_index_raw": 11.5, "digital_noise_score": 89.4, "presence_ratio": 0.07692307692307693, "inverse_noise": 10.6, "life_balance_raw": 10.906666666666665, "life_balance_score": 8.6},
    "safety": {"incidents": 75, "incident_norm": 0.12987012987012986, "safety_index": 87.0, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 34.8, "unique_users": 9},
      {"daypart": "NOON", "score_0_100": 25.0, "unique_users": 11},
      {"daypart": "EVENING", "score_0_100": 25.8, "unique_users": 9}
    ]
  },
  {
    "name": "ochota",
    "code": "ochota",
    "social_life": {"rows": 161, "score": 5.087596335232384, "normalized": 79.7},
    "district_rhythm": {"peak_hour": 15, "activity_amplitude": 99.99999998333334, "avg_activity": 26.81159419842995, "normalized": 63.4},
    "green_places": {"total_obs": 161, "green_obs": 4, "unique_users": 15, "green_ratio": 0.025, "green_life_score": 2.5},
    "digital_noise": {"total_obs": 161, "unique_users": 15, "avg_tech_weight": 0.9503105590062112, "noise_index_raw": 10.2, "digital_noise_score": 78.1},
    "social_availability": {"active_hours": 11, "social_availability_score": 33.3},
    "life_balance": {"total_obs": 161, "unique_users": 15, "avg_tech_weight": 0.9503105590062112, "noise_index_raw": 10.2, "digital_noise_score": 78.1, "presence_ratio": 0.09316770186335403, "inverse_noise": 21.9, "life_balance_raw": 22.093333333333337, "life_balance_score": 21.3},
    "safety": {"incidents": 85, "incident_norm": 0.15584415584415584, "safety_index": 84.4, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 17.4, "unique_users": 5},
      {"daypart": "NOON", "score_0_100": 18.8, "unique_users": 9},
      {"daypart": "EVENING", "score_0_100": 22.6, "unique_users": 8}
    ]
  },
  {
    "name": "włochy",
    "code": "wlochy",
    "social_life": {"rows": 99, "score": 4.605170185988092, "normalized": 68.0},
    "district_rhythm": {"peak_hour": 20, "activity_amplitude": 99.99999998, "avg_activity": 38.26086955756522, "normalized": 69.1},
    "green_places": {"total_obs": 99, "green_obs": 6, "unique_users": 23, "green_ratio": 0.06, "green_life_score": 6.0},
    "digital_noise": {"total_obs": 99, "unique_users": 23, "avg_tech_weight": 0.9686868686868687, "noise_index_raw": 4.169565217391304, "digital_noise_score": 25.5},
    "social_availability": {"active_hours": 18, "social_availability_score": 32.2},
    "life_balance": {"total_obs": 99, "unique_users": 23, "avg_tech_weight": 0.9686868686868688, "noise_index_raw": 4.169565217391304, "digital_noise_score": 25.5, "presence_ratio": 0.23232323232323232, "inverse_noise": 74.5, "life_balance_raw": 86.46666666666667, "life_balance_score": 88.3},
    "safety": {"incidents": 70, "incident_norm": 0.11688311688311688, "safety_index": 88.3, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 47.8, "unique_users": 12},
      {"daypart": "NOON", "score_0_100": 28.1, "unique_users": 12},
      {"daypart": "EVENING", "score_0_100": 22.6, "unique_users": 8}
    ]
  },
  {
    "name": "ursus",
    "code": "ursus",
    "social_life": {"rows": 65, "score": 4.189654742026425, "normalized": 58.0},
    "district_rhythm": {"peak_hour": 10, "activity_amplitude": 99.99999996666666, "avg_activity": 36.50793649576719, "normalized": 68.3},
    "green_places": {"total_obs": 65, "green_obs": 10, "unique_users": 8, "green_ratio": 0.15384615384615385, "green_life_score": 15.4},
    "digital_noise": {"total_obs": 65, "unique_users": 8, "avg_tech_weight": 0.9461538461538461, "noise_index_raw": 7.6875, "digital_noise_score": 56.2},
    "social_availability": {"active_hours": 16, "social_availability_score": 61.1},
    "life_balance": {"total_obs": 65, "unique_users": 8, "avg_tech_weight": 0.946153846153846, "noise_index_raw": 7.6875, "digital_noise_score": 56.2, "presence_ratio": 0.12307692307692308, "inverse_noise": 43.8, "life_balance_raw": 44.18666666666667, "life_balance_score": 46.3},
    "safety": {"incidents": 40, "incident_norm": 0.03896103896103896, "safety_index": 96.1, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 17.4, "unique_users": 5},
      {"daypart": "NOON", "score_0_100": 3.1, "unique_users": 4},
      {"daypart": "EVENING", "score_0_100": 19.4, "unique_users": 7}
    ]
  },
  {
    "name": "praga północ",
    "code": "praga_polnoc",
    "social_life": {"rows": 119, "score": 4.787491742782046, "normalized": 72.4},
    "district_rhythm": {"peak_hour": 4, "activity_amplitude": 99.999999975, "avg_activity": 44.79166665546875, "normalized": 72.4},
    "green_places": {"total_obs": 119, "green_obs": 5, "unique_users": 15, "green_ratio": 0.042, "green_life_score": 4.2},
    "digital_noise": {"total_obs": 119, "unique_users": 15, "avg_tech_weight": 0.9966386554621848, "noise_index_raw": 7.906666666666666, "digital_noise_score": 58.1},
    "social_availability": {"active_hours": 18, "social_availability_score": 12.2},
    "life_balance": {"total_obs": 119, "unique_users": 15, "avg_tech_weight": 0.9966386554621848, "noise_index_raw": 7.906666666666666, "digital_noise_score": 58.1, "presence_ratio": 0.12605042016806722, "inverse_noise": 41.9, "life_balance_raw": 50.093333333333334, "life_balance_score": 53.0},
    "safety": {"incidents": 130, "incident_norm": 0.2727272727272727, "safety_index": 72.7, "safety_level": "Moderate"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 26.1, "unique_users": 7},
      {"daypart": "NOON", "score_0_100": 25.0, "unique_users": 11},
      {"daypart": "EVENING", "score_0_100": 16.1, "unique_users": 6}
    ]
  },
  {
    "name": "wilanów",
    "code": "wilanow",
    "social_life": {"rows": 61, "score": 4.127134385045092, "normalized": 56.5},
    "district_rhythm": {"peak_hour": 4, "activity_amplitude": 99.999999975, "avg_activity": 19.736842100328946, "normalized": 59.9},
    "green_places": {"total_obs": 61, "green_obs": 8, "unique_users": 9, "green_ratio": 0.13, "green_life_score": 13.0},
    "digital_noise": {"total_obs": 61, "unique_users": 9, "avg_tech_weight": 0.8836065573770492, "noise_index_raw": 5.988888888888889, "digital_noise_score": 41.3},
    "social_availability": {"active_hours": 9, "social_availability_score": 22.2},
    "life_balance": {"total_obs": 61, "unique_users": 9, "avg_tech_weight": 0.8836065573770492, "noise_index_raw": 5.988888888888889, "digital_noise_score": 41.3, "presence_ratio": 0.14754098360655737, "inverse_noise": 58.7, "life_balance_raw": 70.14666666666668, "life_balance_score": 75.8},
    "safety": {"incidents": 65, "incident_norm": 0.1038961038961039, "safety_index": 89.6, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 21.7, "unique_users": 6},
      {"daypart": "NOON", "score_0_100": 0.0, "unique_users": 3},
      {"daypart": "EVENING", "score_0_100": 12.9, "unique_users": 5}
    ]
  },
  {
    "name": "żoliborz",
    "code": "zoliborz",
    "social_life": {"rows": 67, "score": 4.219507705176107, "normalized": 58.7},
    "district_rhythm": {"peak_hour": 18, "activity_amplitude": 99.999999975, "avg_activity": 20.45454544943182, "normalized": 60.2},
    "green_places": {"total_obs": 67, "green_obs": 1, "unique_users": 11, "green_ratio": 0.014925373134328358, "green_life_score": 1.5},
    "digital_noise": {"total_obs": 67, "unique_users": 11, "avg_tech_weight": 1.0, "noise_index_raw": 6.090909090909091, "digital_noise_score": 42.2},
    "social_availability": {"active_hours": 12, "social_availability_score": 38.9},
    "life_balance": {"total_obs": 67, "unique_users": 11, "avg_tech_weight": 1.0, "noise_index_raw": 6.090909090909091, "digital_noise_score": 42.2, "presence_ratio": 0.16417910447761194, "inverse_noise": 57.8, "life_balance_raw": 76.45333333333333, "life_balance_score": 83.0},
    "safety": {"incidents": 60, "incident_norm": 0.09090909090909091, "safety_index": 90.9, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 17.4, "unique_users": 5},
      {"daypart": "NOON", "score_0_100": 12.5, "unique_users": 7},
      {"daypart": "EVENING", "score_0_100": 12.9, "unique_users": 5}
    ]
  },
  {
    "name": "wesoła",
    "code": "wesola",
    "social_life": {"rows": 37, "score": 3.6375861597263857, "normalized": 44.6},
    "district_rhythm": {"peak_hour": 9, "activity_amplitude": 99.99999994999999, "avg_activity": 19.44444443472222, "normalized": 59.7},
    "green_places": {"total_obs": 37, "green_obs": 5, "unique_users": 5, "green_ratio": 0.135, "green_life_score": 13.5},
    "digital_noise": {"total_obs": 37, "unique_users": 5, "avg_tech_weight": 0.8918918918918919, "noise_index_raw": 6.6, "digital_noise_score": 46.7},
    "social_availability": {"active_hours": 18, "social_availability_score": 62.2},
    "life_balance": {"total_obs": 37, "unique_users": 5, "avg_tech_weight": 0.8918918918918919, "noise_index_raw": 6.6000000000000005, "digital_noise_score": 46.7, "presence_ratio": 0.13513513513513514, "inverse_noise": 53.3, "life_balance_raw": 61.32, "life_balance_score": 65.8},
    "safety": {"incidents": 25, "incident_norm": 0.0, "safety_index": 100.0, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 13.0, "unique_users": 4},
      {"daypart": "NOON", "score_0_100": 3.1, "unique_users": 4},
      {"daypart": "EVENING", "score_0_100": 3.2, "unique_users": 2}
    ]
  },
  {
    "name": "rembertów",
    "code": "rembertow",
    "social_life": {"rows": 5, "score": 1.791759469228055, "normalized": 0.0},
    "district_rhythm": {"peak_hour": 20, "activity_amplitude": 0.0, "avg_activity": 0.0, "normalized": 0.0},
    "green_places": {"total_obs": 5, "green_obs": 1, "unique_users": 4, "green_ratio": 0.20, "green_life_score": 20.0},
    "digital_noise": {"total_obs": 5, "unique_users": 4, "avg_tech_weight": 1.0, "noise_index_raw": 1.25, "digital_noise_score": 21.3},
    "social_availability": {"active_hours": 5, "social_availability_score": 17.0},
    "life_balance": {"total_obs": 5, "unique_users": 4, "avg_tech_weight": 1.0, "noise_index_raw": 1.25, "digital_noise_score": 21.3, "presence_ratio": 0.8, "inverse_noise": 78.7, "life_balance_raw": 91.48, "life_balance_score": 94.0},
    "safety": {"incidents": 55, "incident_norm": 0.07792207792207792, "safety_index": 92.2, "safety_level": "Safe"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 0.0, "unique_users": 1},
      {"daypart": "NOON", "score_0_100": 0.0, "unique_users": 3},
      {"daypart": "EVENING", "score_0_100": 0.0, "unique_users": 1}
    ]
  },
  {
    "name": "mokotów",
    "code": "mokotow",
    "social_life": {"rows": 269, "score": 5.598421958998375, "normalized": 92.1},
    "district_rhythm": {"peak_hour": 0, "activity_amplitude": 99.99999998571428, "avg_activity": 57.14285713469388, "normalized": 78.6},
    "green_places": {"total_obs": 269, "green_obs": 40, "unique_users": 31, "green_ratio": 0.14869888475836432, "green_life_score": 14.9},
    "digital_noise": {"total_obs": 269, "unique_users": 31, "avg_tech_weight": 0.9802973977695166, "noise_index_raw": 8.506451612903225, "digital_noise_score": 63.3},
    "social_availability": {"active_hours": 23, "social_availability_score": 32.0},
    "life_balance": {"total_obs": 269, "unique_users": 31, "avg_tech_weight": 0.9802973977695166, "noise_index_raw": 8.506451612903225, "digital_noise_score": 63.3, "presence_ratio": 0.11524163568773234, "inverse_noise": 36.7, "life_balance_raw": 34.68, "life_balance_score": 35.6},
    "safety": {"incidents": 280, "incident_norm": 0.6623376623376623, "safety_index": 33.8, "safety_level": "High risk"},
    "dayparts": [
      {"daypart": "MORNING", "score_0_100": 21, "unique_users": 87.0},
      {"daypart": "NOON", "score_0_100": 21, "unique_users": 56.2},
      {"daypart": "EVENING", "score_0_100": 14, "unique_users": 41.9}
    ]
  }
]


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    for d in districts_data:
        district = District(
            name=d["name"],
            code=d["code"],
            district_type=None,
        )
        session.add(district)
        session.flush()

        for dp in d.get("dayparts", []):
            aggregate = DistrictAggregate(
                district_id=district.id,
                daypart=dp["daypart"],
                score_0_100=dp["score_0_100"],
                unique_users=dp["unique_users"],
            )
            session.add(aggregate)

        if "social_life" in d:
            social_life = SocialLife(
                district_id=district.id,
                normalized_score=d["social_life"]["normalized"],
                raw_score=d["social_life"]["score"],
                rows=d["social_life"]["rows"]
            )
            session.add(social_life)

        if "district_rhythm" in d:
            rhythm = DistrictRhythm(
                district_id=district.id,
                peak_hour=d["district_rhythm"]["peak_hour"],
                activity_amplitude=d["district_rhythm"]["activity_amplitude"],
                avg_activity=d["district_rhythm"]["avg_activity"],
                rhythm_score=d["district_rhythm"]["normalized"]
            )
            session.add(rhythm)

        if "green_places" in d:
            green = GreenPlaces(
                district_id=district.id,
                total_obs=d["green_places"]["total_obs"],
                green_obs=d["green_places"]["green_obs"],
                unique_users=d["green_places"]["unique_users"],
                green_ratio=d["green_places"]["green_ratio"],
                green_life_score=d["green_places"]["green_life_score"]
            )
            session.add(green)

        if "digital_noise" in d:
            noise = DigitalNoise(
                district_id=district.id,
                total_obs=d["digital_noise"]["total_obs"],
                unique_users=d["digital_noise"]["unique_users"],
                avg_tech_weight=d["digital_noise"]["avg_tech_weight"],
                noise_index_raw=d["digital_noise"]["noise_index_raw"],
                digital_noise_score=d["digital_noise"]["digital_noise_score"]
            )
            session.add(noise)

        if "social_availability" in d:
            sa_model = SocialAvailability(
                district_id=district.id,
                active_hours=d["social_availability"]["active_hours"],
                social_availability_score=d["social_availability"]["social_availability_score"]
            )
            session.add(sa_model)

        if "life_balance" in d:
            lb = LifeBalance(
                district_id=district.id,
                total_obs=d["life_balance"]["total_obs"],
                unique_users=d["life_balance"]["unique_users"],
                avg_tech_weight=d["life_balance"]["avg_tech_weight"],
                noise_index_raw=d["life_balance"]["noise_index_raw"],
                digital_noise_score=d["life_balance"]["digital_noise_score"],
                presence_ratio=d["life_balance"]["presence_ratio"],
                inverse_noise=d["life_balance"]["inverse_noise"],
                life_balance_raw=d["life_balance"]["life_balance_raw"],
                life_balance_score=d["life_balance"]["life_balance_score"]
            )
            session.add(lb)

        if "safety" in d:
            safety = Safety(
                district_id=district.id,
                incidents=d["safety"]["incidents"],
                incident_norm=d["safety"]["incident_norm"],
                safety_index=d["safety"]["safety_index"],
                safety_level=d["safety"]["safety_level"]
            )
            session.add(safety)

    session.commit()

def downgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)
    session.query(DistrictAggregate).delete()
    session.query(GreenPlaces).delete()
    session.query(DigitalNoise).delete()
    session.query(SocialAvailability).delete()
    session.query(LifeBalance).delete()
    session.query(Safety).delete()
    session.query(District).delete()
    session.commit()
