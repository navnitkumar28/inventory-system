"""
Order Service
-------------
Critical business logic lives here:
  1. Verify customer exists.
  2. Verify product exists.
  3. Reject the order if stock is insufficient (HTTP 422).
  4. Decrement stock atomically inside the same transaction.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import Order, Customer, Product
from app.schemas.order  import OrderCreate


def get_all_orders(db: Session) -> list[Order]:
    """Return all orders, newest first, with related data pre-loaded."""
    return (
        db.query(Order)
        .join(Customer)
        .join(Product)
        .order_by(Order.id.desc())
        .all()
    )


def get_order_by_id(db: Session, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id={order_id} not found.",
        )
    return order


def create_order(db: Session, payload: OrderCreate) -> Order:
    """
    Place a new order.

    Steps:
        1. Load customer – 404 if missing.
        2. Load product  – 404 if missing.
        3. Check stock   – 422 if insufficient.
        4. Deduct stock and persist both records in one commit.
    """
    # Step 1 – customer must exist
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id={payload.customer_id} not found.",
        )

    # Step 2 – product must exist
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={payload.product_id} not found.",
        )

    # Step 3 – stock check  ← BUSINESS RULE
    if product.stock < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Insufficient stock for '{product.name}'. "
                f"Requested: {payload.quantity}, available: {product.stock}."
            ),
        )

    # Step 4 – deduct stock and create order atomically
    product.stock -= payload.quantity

    order = Order(
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
