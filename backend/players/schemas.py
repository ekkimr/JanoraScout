from datetime import date, datetime
from pydantic import BaseModel


class PlayerOut(BaseModel):
    id: int
    academy_id: int
    name: str
    jersey_number: int
    jersey_color: str
    position: str
    date_of_birth: date | None
    created_at: datetime

    model_config = {"from_attributes": True}
