"""
Products Router
---------------
Exposes CRUD endpoints for the /api/products prefix.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database   import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead
from app.services        import product_service

router = APIRouter()


@router.get("/", response_model=list[ProductRead], summary="List all products")
def list_products(db: Session = Depends(get_db)):
    """Returns every product in the inventory."""
    return product_service.get_all_products(db)


@router.get("/{product_id}", response_model=ProductRead, summary="Get a single product")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Fetch one product by its primary key."""
    return product_service.get_product_by_id(db, product_id)


@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product.
    - SKU must be unique (409 if conflict).
    - Price must be > 0; stock must be >= 0.
    """
    return product_service.create_product(db, payload)


@router.put("/{product_id}", response_model=ProductRead, summary="Update a product")
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Partial update – only supply the fields you want to change."""
    return product_service.update_product(db, product_id, payload)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a product",
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Permanently remove a product from the catalogue."""
    return product_service.delete_product(db, product_id)
