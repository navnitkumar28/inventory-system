"""
Product Service
---------------
All database operations for products live here.
Routers call these functions – they never query the DB directly.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models  import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_all_products(db: Session) -> list[Product]:
    """Return every product ordered by id."""
    return db.query(Product).order_by(Product.id).all()


def get_product_by_id(db: Session, product_id: int) -> Product:
    """Fetch one product or raise 404."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={product_id} not found.",
        )
    return product


def create_product(db: Session, payload: ProductCreate) -> Product:
    """
    Insert a new product.
    Raises 409 if the SKU is already taken.
    """
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{payload.sku}' already exists.",
        )

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    """
    Partial update – only supplied fields are changed.
    Raises 409 if the new SKU conflicts with an existing product.
    """
    product = get_product_by_id(db, product_id)

    updates = payload.model_dump(exclude_unset=True)

    # Uniqueness check for SKU if it's being changed
    if "sku" in updates and updates["sku"] != product.sku:
        conflict = db.query(Product).filter(Product.sku == updates["sku"]).first()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"SKU '{updates['sku']}' is already used by another product.",
            )

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> dict:
    """Delete a product. Returns a confirmation message."""
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()
    return {"detail": f"Product id={product_id} deleted successfully."}
