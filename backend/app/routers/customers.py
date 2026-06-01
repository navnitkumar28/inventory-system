"""
Customers Router
----------------
Exposes CRUD endpoints for the /api/customers prefix.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database    import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerRead
from app.services         import customer_service

router = APIRouter()


@router.get("/", response_model=list[CustomerRead], summary="List all customers")
def list_customers(db: Session = Depends(get_db)):
    return customer_service.get_all_customers(db)


@router.get("/{customer_id}", response_model=CustomerRead, summary="Get a single customer")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer_by_id(db, customer_id)


@router.post(
    "/",
    response_model=CustomerRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a customer",
)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    """
    Register a new customer.
    - Email must be unique (409 if conflict).
    """
    return customer_service.create_customer(db, payload)


@router.put("/{customer_id}", response_model=CustomerRead, summary="Update a customer")
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
):
    return customer_service.update_customer(db, customer_id, payload)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a customer",
)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.delete_customer(db, customer_id)
