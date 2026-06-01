"""
Pydantic schemas for Customers.
"""

from pydantic import BaseModel, EmailStr, Field


class CustomerBase(BaseModel):
    name:  str      = Field(..., min_length=1, max_length=255, examples=["Alice Smith"])
    email: EmailStr = Field(..., examples=["alice@example.com"])


class CustomerCreate(CustomerBase):
    """Schema used when creating a new customer (POST)."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for partial updates (PUT)."""
    name:  str      | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None


class CustomerRead(CustomerBase):
    """Schema returned to the client."""
    id: int

    model_config = {"from_attributes": True}
