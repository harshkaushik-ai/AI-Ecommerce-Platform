# AI E-Commerce Platform

A full-stack AI-enabled e-commerce web application featuring intelligent product search using **Google Gemini API** and secure online payments via **Stripe**. The platform delivers a modern shopping experience with authentication, cart management, and order processing.

---

## 🚀 Features

* 🔍 **AI Product Search** – Smart natural-language product search powered by Google Gemini API
* 🛒 **E-Commerce Core** – Product listings, cart, checkout, and order management
* 💳 **Secure Payments** – Stripe payment gateway integration
* 👤 **User Authentication** – Login, registration, and protected routes
* 📦 **Order Tracking** – View order history and payment status
* 🧑‍💼 **Admin Panel** – Manage products, users, and orders
* 🌙 **Modern UI** – Responsive React UI with clean UX

---

## 🛠 Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication

### Integrations

* Google Gemini API (AI Search)
* Stripe (Payments)

---

## 📂 Project Structure

```
client/        # React frontend
server/        # Node + Express backend
 ├─ routes/    # API routes
 ├─ controllers/
 ├─ middlewares/
 ├─ database/
 └─ utils/
```

---

## ⚙️ Environment Variables

Create a `.env` file in both **client** and **server** directories.

### Backend (`server/.env`)

```
PORT=5000
DATABASE_URL=your_postgres_connection
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`client/.env`)

```
VITE_API_BASE_URL=http://localhost:5000
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## ▶️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/harshkaushik-ai/AI-Ecommerce-Platform.git
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run the Application

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

---

## 🧠 AI Search Workflow

1. User enters a natural language search query
2. Query is sent to Gemini API
3. AI processes intent and returns relevant product results
4. Products are ranked and displayed dynamically

---

## 🔐 Payments Workflow

* Stripe Payment Intent is generated on the backend
* Secure checkout handled via Stripe
* Payment status saved in the database

---

## 📌 Future Enhancements

* Product recommendations based on user behavior
* Review & rating system
* AI chatbot for shopping assistance
* Wishlist and advanced filtering

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🙌 Author

**Harsh Kaushik**
BTech Student | Full Stack Developer | AI Enthusiast

---

⭐ If you like this project, feel free to star the repository!
