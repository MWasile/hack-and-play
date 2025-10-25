from enum import Enum


class Daypart(str, Enum):
    MORNING = "MORNING"
    NOON = "NOON"
    EVENING = "EVENING"
    NIGHT = "NIGHT"

class DistrictType(str, Enum):
    BEDROOM = "BEDROOM"
    FAMILY = "FAMILY"
    OFFICE = "OFFICE"
    MIXED = "MIXED"
    OTHER = "OTHER"
