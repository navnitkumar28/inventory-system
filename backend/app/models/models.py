"""
ORM Models
----------
Defines the three database tables:
  - Product
  - Customer
  - Order
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    """
    Represents a product in the inventory.

    Columns:
        id      – auto-increment primary key
        name    – human-readable product name
        sku     – Stock Keeping Unit; must be globally unique
        price   – unit price (USD or any currency)
        stock   – current available quantity
    """
    __tablename__ = "products"

    id    = Column(Integer, primary_key=True, index=True)
    name  = Column(String(255), nullable=False)
    sku   = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)

    # One product can appear in many order lines
    orders = relationship("Order", back_populates="product")


class Customer(Base):
    """
    Represents a customer.

    Columns:
        id    – auto-increment primary key
        name  – full name
        email – must be unique across all customers
    """
    __tablename__ = "customers"

    id    = Column(Integer, primary_key=True, index=True)
    name  = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)

    # A customer can have many orders
    orders = relationship("Order", back_populates="customer")


class Order(Base):
    """
    Represents a single order line.

    Business rules enforced at the service layer:
      - stock must be >= quantity before the order is committed
      - stock is decremented atomically when the order is saved
    """
    __tablename__ = "orders"

    id          = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("products.id"),  nullable=False)
    quantity    = Column(Integer, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="orders")
    product  = relationship("Product",  back_populates="orders")
