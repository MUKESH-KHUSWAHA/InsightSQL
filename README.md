# InsightSQL — Business Analytics Platform

> AI-powered SQL analytics with natural language querying

A full-stack business analytics platform demonstrating PostgreSQL analytics, React data visualization, Express REST APIs, and AI-powered natural-language-to-SQL querying using Google Gemini.

**Tech Stack:** React 19 • Vite 8 • Tailwind CSS • Node.js • Express 5 • PostgreSQL (Neon) • Google Gemini API

---

## 📸 Features

### 📊 Analytics Dashboard
- **KPI Summary Cards** — Total revenue, orders, customers, retention rate
- **Revenue Trend Chart** — 18-month line chart with tooltips
- **Top Products Chart** — Horizontal bar chart showing revenue by product
- **Top Customers Table** — Ranked customer spending with medal badges
- **At-Risk Customers Table** — Customers with no recent orders (90+ days)
- **Retention Rate Gauge** — Animated SVG ring showing repeat purchase percentage

### 🤖 Ask AI (Natural Language to SQL)
- **Natural language input** — Ask business questions in plain English
- **AI SQL generation** — Gemini converts questions to PostgreSQL queries
- **Safety validation** — Multi-layer SQL validation prevents dangerous queries
- **Read-only execution** — Database-enforced read-only transactions
- **Query timeout** — 5-second limit prevents runaway queries
- **Results display** — Dynamic table with formatted numbers and dates

### 🔒 Security Features
- ✅ **SQL injection prevention** — Parameterized queries, dangerous keyword blocking
- ✅ **Read-only enforcement** — Database transactions set to READ ONLY
- ✅ **Input validation** — Length limits, type checking, sanitization
- ✅ **Environment isolation** — Secrets in .env, never exposed to frontend
- ✅ **CORS protection** — Restricted origins in production
- ✅ **Error handling** — No stack traces in production responses

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **PostgreSQL database** on Neon (connection string required)
- **Google Gemini API key** (for AI features)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/InsightSQL.git
cd InsightSQL
```

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

### 2. Configure Environment

Create `Backend/.env` (use `Backend/.env.example` as template):

```env
# PostgreSQL connection string (Neon)
DATABASE_URL=postgresql://user:password@host.region.neon.tech/database?sslmode=require

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Server configuration
PORT=5000
NODE_ENV=development
```

**⚠️ NEVER commit `.env` to version control!**

### 3. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```
Server runs on: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```
App runs on: `http://localhost:5173`

### 4. Access the Application

- **Dashboard:** http://localhost:5173/
- **Ask AI:** http://localhost:5173/ask
- **Health Check:** http://localhost:5000/api/health

---

## 📁 Project Structure

```
InsightSQL/
├── Backend/
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── db/              # Database connection pool
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # SQL validation, read-only executor
│   │   └── server.js        # Express app entry point
│   ├── test-*.js            # Test files
│   ├── .env                 # Environment variables (not committed)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Dashboard, AskAI)
│   │   ├── services/        # API client (axios)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── App.jsx          # Root router
│   │   └── main.jsx         # React entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
└── README.md                # This file
```

---

## 🧪 Testing

### Run All Tests

**Backend tests:**
```bash
cd Backend

# SQL validator unit tests
node test-validator.js

# Analytics service tests (requires DB)
node test-service.js

# REST API tests (requires running server)
node test-api.js

# Edge case tests (requires running server)
node test-edge-cases.js

# AI /api/ask tests (requires running server + Gemini API)
node test-ask.js
```

**Frontend build:**
```bash
cd Frontend
npm run build
```

### Expected Results

- ✅ **test-validator.js** — 14/14 tests pass
- ✅ **test-service.js** — All queries return data
- ✅ **test-api.js** — 11/11 endpoints respond correctly
- ✅ **test-edge-cases.js** — All input validation tests pass
- ✅ **test-ask.js** — Valid questions succeed, dangerous queries blocked (requires Gemini API)
- ✅ **npm run build** — 0 errors, ~667 modules

---

## 🔌 API Endpoints

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DB connectivity test |
| GET | `/api/summary` | Dashboard KPIs (revenue, orders, customers) |
| GET | `/api/revenue/monthly` | 18-month revenue trend |
| GET | `/api/products/top?limit=10` | Top products by revenue |
| GET | `/api/customers/top?limit=10` | Top customers by spending |
| GET | `/api/customers/at-risk` | Customers with no orders in 90+ days |
| GET | `/api/retention` | Repeat purchase retention rate |

### AI Endpoint

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ask` | `{ "question": "..." }` | Natural language to SQL |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What was our monthly revenue?"}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "question": "What was our monthly revenue?",
    "sql": "SELECT DATE_TRUNC('month', order_date) AS month, SUM(quantity * unit_price) AS revenue FROM orders JOIN order_items USING (order_id) WHERE status = 'completed' GROUP BY month ORDER BY month;",
    "columns": ["month", "revenue"],
    "rows": [
      { "month": "2024-01-01T00:00:00.000Z", "revenue": "12450.00" },
      { "month": "2024-02-01T00:00:00.000Z", "revenue": "15230.00" }
    ],
    "rowCount": 18
  }
}
```

---

## 🗄️ Database Schema

### Tables

**customers** — Customer information
```sql
customer_id  SERIAL PRIMARY KEY
name         VARCHAR(100)
email        VARCHAR(100)
signup_date  DATE
```

**products** — Product catalog
```sql
product_id  SERIAL PRIMARY KEY
name        VARCHAR(100)
category    VARCHAR(50)
price       NUMERIC(10,2)
```

**orders** — Order headers
```sql
order_id     SERIAL PRIMARY KEY
customer_id  INT REFERENCES customers(customer_id)
order_date   DATE
status       VARCHAR(20) DEFAULT 'completed'
```

**order_items** — Order line items
```sql
order_item_id  SERIAL PRIMARY KEY
order_id       INT REFERENCES orders(order_id)
product_id     INT REFERENCES products(product_id)
quantity       INT
unit_price     NUMERIC(10,2)
```

### Relationships
```
customers → orders → order_items ← products
```

---

## 🤖 AI Implementation Details

### System Prompt
The Gemini AI receives a schema-aware system prompt that includes:
- Exact table and column definitions
- Relationship descriptions
- Business rules (e.g., always filter `status = 'completed'`)
- SQL rules (only SELECT, no DDL/DML)

### Safety Layers (Defense-in-Depth)

1. **Prompt Engineering** — System prompt instructs Gemini to generate safe SQL
2. **SQL Validation** — `sqlValidator.js` rejects dangerous keywords (INSERT, UPDATE, DELETE, DROP, etc.)
3. **Read-Only Transaction** — PostgreSQL enforces `BEGIN READ ONLY` at database level
4. **Query Timeout** — 5-second limit prevents long-running queries

---

## 🎨 UI/UX Features

- **Dark theme** with custom color palette
- **Responsive design** (mobile sidebar, desktop layout)
- **Loading states** (spinners, skeletons)
- **Error states** (retry buttons, friendly messages)
- **Empty states** (helpful guidance)
- **Smooth animations** (transitions, hover effects)
- **Accessible controls** (semantic HTML, ARIA labels)
- **Professional typography** (Inter font, proper hierarchy)

---

## 🔧 Configuration

### Frontend (Vite)
- **Proxy:** `/api/*` → `http://localhost:5000` (avoids CORS in development)
- **Build:** Optimized production build with code splitting
- **Linting:** Oxlint for fast code quality checks

### Backend (Express)
- **CORS:** Restricted to `http://localhost:5173` in development
- **JSON:** 1MB body size limit
- **Timeout:** 5-second query timeout for AI-generated SQL
- **Pool:** Max 10 database connections

---

## 📝 Development Workflow

1. **Start backend:** `cd Backend && npm run dev`
2. **Start frontend:** `cd Frontend && npm run dev`
3. **Make changes** (hot reload enabled)
4. **Run tests** before committing
5. **Build frontend:** `npm run build` (verify no errors)

### Code Style
- **Backend:** CommonJS modules, async/await
- **Frontend:** ES modules, React hooks, functional components
- **Formatting:** Consistent indentation, descriptive variable names
- **Comments:** JSDoc for functions, inline for complex logic

---

## 🚢 Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd Frontend
npm run build
# Upload dist/ folder to hosting
```

Set environment variable:
- `VITE_API_URL=https://your-backend.com`

### Backend (Railway/Render/Heroku)
```bash
cd Backend
npm start
```

Set environment variables:
- `DATABASE_URL=postgresql://...`
- `GEMINI_API_KEY=...`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend.com` (for CORS)

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check `.env` exists with valid `DATABASE_URL` and `GEMINI_API_KEY`
- ✅ Run `npm install` to ensure dependencies are installed
- ✅ Verify Neon database is accessible (test connection string)

### Frontend API calls fail
- ✅ Ensure backend is running on `http://localhost:5000`
- ✅ Check browser console for CORS errors
- ✅ Verify Vite proxy is configured in `vite.config.js`

### AI questions fail
- ✅ Verify `GEMINI_API_KEY` is valid and has quota
- ✅ Check backend logs for Gemini API errors

### Tests fail
- ✅ Ensure backend server is running for API tests
- ✅ Check database connection for service tests
- ✅ Verify Gemini API quota for AI tests

---

## 📚 Tech Stack Details

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend UI framework | 19.2.8 |
| **Vite** | Build tool & dev server | 8.2.2 |
| **Tailwind CSS** | Utility-first CSS | 3.4.19 |
| **Recharts** | Data visualization | 3.10.1 |
| **Axios** | HTTP client | 1.19.0 |
| **Express** | Backend web framework | 5.2.1 |
| **pg** | PostgreSQL client | 8.23.0 |
| **Google Generative AI** | Gemini API SDK | 0.24.1 |
| **dotenv** | Environment variables | 17.4.2 |

---

## 🤝 Contributing

This is an interview portfolio project. Suggestions and feedback welcome!

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👤 Author

Built to demonstrate full-stack engineering skills including:
- PostgreSQL analytics and query optimization
- REST API design and security
- React data visualization and state management
- AI integration with prompt engineering
- Production-ready error handling and validation

---

**Built with ❤️ using React, Express, PostgreSQL, and Google Gemini**
