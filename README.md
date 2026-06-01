# 📦 Inventory & Order Management System

A full-stack web application for managing products, customers, and orders — built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## 🗂️ Project Structure

```
inventory-system/
│
├── backend/                        # FastAPI Python backend
│   ├── app/
│   │   ├── core/
│   │   │   └── database.py         # SQLAlchemy engine + session + Base
│   │   ├── models/
│   │   │   └── models.py           # ORM models: Product, Customer, Order
│   │   ├── schemas/
│   │   │   ├── product.py          # Pydantic schemas for products
│   │   │   ├── customer.py         # Pydantic schemas for customers
│   │   │   └── order.py            # Pydantic schemas for orders
│   │   ├── services/
│   │   │   ├── product_service.py  # Business logic for products
│   │   │   ├── customer_service.py # Business logic for customers
│   │   │   └── order_service.py    # Business logic + stock management
│   │   ├── routers/
│   │   │   ├── products.py         # /api/products endpoints
│   │   │   ├── customers.py        # /api/customers endpoints
│   │   │   └── orders.py           # /api/orders endpoints
│   │   └── main.py                 # App factory + CORS + router registration
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                       # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Modal.jsx           # Reusable modal dialog
│   │   ├── pages/
│   │   │   ├── ProductsPage.jsx    # Full CRUD for products
│   │   │   ├── CustomersPage.jsx   # Full CRUD for customers
│   │   │   └── OrdersPage.jsx      # Create orders + view history
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + all API functions
│   │   ├── App.js                  # Routes + sidebar layout
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global design system styles
│   ├── nginx.conf                  # Nginx config for React Router
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml              # Orchestrates backend + frontend + db
├── .env.example                    # Root env for docker-compose
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

```
┌─────────────────────┐       ┌─────────────────────┐
│      products       │       │      customers       │
├─────────────────────┤       ├─────────────────────┤
│ id       INT  PK    │       │ id       INT  PK     │
│ name     VARCHAR    │       │ name     VARCHAR     │
│ sku      VARCHAR UQ │       │ email    VARCHAR UQ  │
│ price    FLOAT      │       └──────────┬──────────┘
│ stock    INT        │                  │
└──────────┬──────────┘                  │
           │                             │
           │        ┌────────────────────┴──────────┐
           │        │           orders              │
           │        ├───────────────────────────────┤
           └───────►│ id           INT  PK          │
                    │ customer_id  INT  FK           │◄──┘
                    │ product_id   INT  FK           │
                    │ quantity     INT               │
                    │ created_at   DATETIME          │
                    └───────────────────────────────┘
```

---

## ⚙️ Business Rules

| Rule | Behaviour |
|---|---|
| Unique SKU | `409 Conflict` if a product with the same SKU already exists |
| Unique email | `409 Conflict` if a customer with the same email already exists |
| Sufficient stock | `422 Unprocessable Entity` if `quantity > stock` |
| Auto stock deduction | Stock is decremented atomically when an order is placed |

---

## 🔌 API Endpoints

### Products — `/api/products`

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/`           | List all products |
| GET    | `/{id}`       | Get product by ID |
| POST   | `/`           | Create product |
| PUT    | `/{id}`       | Update product (partial) |
| DELETE | `/{id}`       | Delete product |

**Create / Update payload:**
```json
{
  "name":  "Laptop Pro",
  "sku":   "LP-001",
  "price": 999.99,
  "stock": 50
}
```

### Customers — `/api/customers`

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/`     | List all customers |
| GET    | `/{id}` | Get customer by ID |
| POST   | `/`     | Create customer |
| PUT    | `/{id}` | Update customer |
| DELETE | `/{id}` | Delete customer |

**Create / Update payload:**
```json
{
  "name":  "Alice Smith",
  "email": "alice@example.com"
}
```

### Orders — `/api/orders`

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/`     | List all orders (newest first) |
| GET    | `/{id}` | Get order by ID |
| POST   | `/`     | Place new order |

**Create payload:**
```json
{
  "customer_id": 1,
  "product_id":  3,
  "quantity":    2
}
```

**Response includes nested customer and product:**
```json
{
  "id": 1,
  "quantity": 2,
  "created_at": "2024-01-15T10:30:00",
  "customer": { "id": 1, "name": "Alice Smith", "email": "alice@example.com" },
  "product":  { "id": 3, "name": "Laptop Pro", "sku": "LP-001", "price": 999.99, "stock": 48 }
}
```

---

## 🚀 Running Locally

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/inventory-system.git
cd inventory-system

# 2. Create .env files from examples
cp .env.example .env
cp backend/.env.example backend/.env

# 3. (Optional) Edit passwords in .env and backend/.env

# 4. Start all services with Docker Compose
docker-compose up --build

# Services will be available at:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:8000
#   API docs  →  http://localhost:8000/docs   (Swagger UI)
#   Postgres  →  localhost:5432
```

### Development Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your DATABASE_URL in backend/.env
# (point it to a local Postgres instance)

uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install

# Create frontend/.env with:
# REACT_APP_API_URL=http://localhost:8000/api

npm start   # opens http://localhost:3000
```

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub.
2. Go to [render.com](https://render.com) → New → **Web Service**.
3. Connect your repo; set root directory to `backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `DATABASE_URL` → your Railway/Render Postgres URL.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable: `REACT_APP_API_URL` → your Render backend URL + `/api`.
4. Deploy — Vercel builds automatically on every push.

### Database → Railway

1. Go to [railway.app](https://railway.app) → New Project → **Provision PostgreSQL**.
2. Copy the `DATABASE_URL` from the Variables tab.
3. Paste it into your Render backend environment variables.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| API Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Database | PostgreSQL 16 |
| Frontend | React 18 + React Router v6 |
| HTTP client | Axios |
| Notifications | react-hot-toast |
| Containerisation | Docker + Docker Compose |
| Web server (prod) | Nginx |

---

## 📄 License

MIT — free to use, modify, and distribute.
