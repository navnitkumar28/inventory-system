"""
Customer Service
----------------
All database operations for customers live here.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models   import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def get_all_customers(db: Session) -> list[Customer]:
    return db.query(Customer).order_by(Customer.id).all()


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id={customer_id} not found.",
        )
    return customer


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    """Raises 409 if the email is already registered."""
    existing = db.query(Customer).filter(Customer.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{payload.email}' already exists.",
        )

    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, payload: CustomerUpdate) -> Customer:
    customer = get_customer_by_id(db, customer_id)
    updates  = payload.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"] != customer.email:
        conflict = db.query(Customer).filter(Customer.email == updates["email"]).first()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{updates['email']}' is already used by another customer.",
            )

    for field, value in updates.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> dict:
    customer = get_customer_by_id(db, customer_id)
    db.delete(customer)
    db.commit()
    return {"detail": f"Customer id={customer_id} deleted successfully."}
