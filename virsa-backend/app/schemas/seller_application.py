from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class SellerApplicationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    needs_more_info = "needs_more_info"


class SellerApplicationCreate(BaseModel):
    business_name: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=20, max_length=5000)

    @field_validator("business_name", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class SellerApplicationReview(BaseModel):
    status: SellerApplicationStatus
    review_notes: Optional[str] = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_review_notes(self) -> "SellerApplicationReview":
        if self.review_notes is not None:
            self.review_notes = self.review_notes.strip()
        if self.status == SellerApplicationStatus.pending:
            raise ValueError("A review must move the application out of pending.")
        if self.status in {
            SellerApplicationStatus.rejected,
            SellerApplicationStatus.needs_more_info,
        } and not self.review_notes:
            raise ValueError(
                "review_notes is required when rejecting or requesting more information."
            )
        return self


class SellerApplicationResponse(BaseModel):
    id: int
    applicant_id: int
    business_name: str
    description: str
    status: SellerApplicationStatus
    submitted_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[int]
    review_notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)
