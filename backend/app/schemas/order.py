"""
Pydantic schemas for Orders.
"""

from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.product  import ProductRead
from app.schemas.customer import CustomerRead


class OrderCreate(BaseModel):
    """Schema used when placing a new order (POST)."""
    customer_id: int = Field(..., gt=0, examples=[1])
    product_id:  int = Field(..., gt=0, examples=[3])
    quantity:    int = Field(..., gt=0, examples=[2])


class OrderRead(BaseModel):
    """
    Schema returned to the client.
    Embeds nested customer and product objects for a richer response.
    """
    id:          int
    quantity:    int
    created_at:  datetime
    customer:    CustomerRead
    product:     ProductRead

    model_config = {"from_attributes": True}
