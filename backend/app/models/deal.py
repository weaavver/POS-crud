from pydantic import BaseModel, Field


class DealSet(BaseModel):
    percent: int = Field(ge=1, le=99)