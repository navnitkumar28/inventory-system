"""
Pydantic schemas for Products.

Separating "input" schemas (Create / Update) from
"output" schemas (Read) keeps validation clean.
"""

from pydantic import BaseModel, Field, field_validator


class ProductBase(BaseModel):
    name:  str   = Field(..., min_length=1, max_length=255, examples=["Laptop Pro"])
    sku:   str   = Field(..., min_length=1, max_length=100,  examples=["LP-001"])
    price: float = Field(..., gt=0, examples=[999.99])
    stock: int   = Field(..., ge=0, examples=[50])

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v: str) -> str:
        """Normalise SKU to uppercase for consistent lookups."""
        return v.strip().upper()


class ProductCreate(ProductBase):
    """Schema used when creating a new product (POST)."""
    pass


class ProductUpdate(BaseModel):
    """
    Schema for partial updates (PUT).
    All fields are optional so callers only send what changed.
    """
    name:  str   | None = Field(None, min_length=1, max_length=255)
    sku:   str   | None = Field(None, min_length=1, max_length=100)
    price: float | None = Field(None, gt=0)
    stock: int   | None = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v: str | None) -> str | None:
        return v.strip().upper() if v else v


class ProductRead(ProductBase):
    """Schema returned to the client – includes the DB-generated id."""
    id: int

    model_config = {"from_attributes": True}
