"""
Orders Router
-------------
Exposes Create + View endpoints for the /api/orders prefix.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderRead
from app.services      import order_service

router = APIRouter()


@router.get("/", response_model=list[OrderRead], summary="List all orders")
def list_orders(db: Session = Depends(get_db)):
    """Returns all orders (newest first), each with embedded customer and product."""
    return order_service.get_all_orders(db)


@router.get("/{order_id}", response_model=OrderRead, summary="Get a single order")
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order_by_id(db, order_id)


@router.post(
    "/",
    response_model=OrderRead,
    status_code=status.HTTP_201_CREATED,
    summary="Place a new order",
)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Place a new order.
    - Returns 404 if customer or product doesn't exist.
    - Returns 422 if product stock is insufficient.
    - Decrements product stock on success.
    """
    return order_service.create_order(db, payload)
