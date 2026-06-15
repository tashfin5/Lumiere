# 🌟 Lumiere E-Commerce Platform

![Lumiere Platform Banner](https://img.shields.io/badge/Lumiere-E--Commerce-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-Backend-gray?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)

Lumiere is a state-of-the-art, full-stack, responsive e-commerce web application designed to offer a seamless shopping experience and a robust administration back-office. It features a modern customer storefront and a comprehensive admin dashboard, meticulously engineered for performance, aesthetic appeal, and scalability.

## 🚀 Key Features

### 🛍️ Customer Storefront
- **Dynamic Product Discovery**: Browse, filter, and search products effortlessly across different categories and brands.
- **Special Offers & Promotions**: Visually appealing highlights for ongoing deals and promotional offers.
- **Cart & Checkout Flow**: Intuitive and persistent shopping cart integration.
- **User Accounts & Profiles**: Secure user registration, authentication, and personalized profile management.
- **Responsive & Animated UI**: Crafted with Framer Motion and Tailwind CSS for smooth micro-interactions on all devices.

### 🛡️ Admin Dashboard
- **Catalog Management**: Full CRUD capabilities for Products, Categories, Brands, and Promotional Offers.
- **Media Uploads**: Seamless image uploads powered by Cloudinary integration.
- **Order Tracking System**: Comprehensive tracking and status updates for customer orders.
- **Site Analytics & Statistics**: Real-time insights into user registrations, active products, and sales statistics.
- **Secure Access Control**: JWT-based role authorization to restrict dashboard access to administrative personnel.

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for predictable and unopinionated global state.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid transitions and layout animations.
- **Iconography**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **HTTP Client**: Axios

### Backend (`/server`)
- **Runtime Environment**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` for secure password hashing.
- **File Storage**: [Cloudinary](https://cloudinary.com/) (managed via `multer-storage-cloudinary`).

## 📦 Project Architecture

```text
Lumiere/
├── client/                     # Next.js 15 Frontend
│   ├── app/                    # Next.js App Router (/(store), /admin, /product)
│   ├── components/             # Reusable UI components & Layouts
│   ├── store/                  # Zustand state slices (Cart, User, etc.)
│   └── utils/                  # Helper utilities and API service wrappers
└── server/                     # Express.js API Backend
    ├── config/                 # Environment and Database configuration
    ├── controllers/            # Route logic (Products, Users, Orders, etc.)
    ├── models/                 # Mongoose Data Schemas (User, Product, Order, Category, Brand, Offer, SiteStats)
    ├── routes/                 # Express API Endpoints
    └── middleware/             # Custom middlewares (Auth Guard, Error Handling)
```

## 🔌 Core API Architecture

The backend exposes a structured RESTful API:

- `/api/users`: Authentication (Register, Login), Profile Management.
- `/api/products`: Product catalog retrieval, creation, updating, and deletion.
- `/api/orders`: Order placement, retrieval, and status tracking.
- `/api/categories` & `/api/brands`: Taxonomy management for the catalog.
- `/api/offers`: Promotional banners and special deal configurations.
- `/api/upload`: Integrated endpoint for handling Cloudinary media uploads.
- `/api/stats`: Analytical endpoints for the admin dashboard.

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server (runs on `http://localhost:5000` by default):
```bash
npm start
```

### 2. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application will now be available:
- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin) (Requires Admin Authentication)

## 📄 License

This project is open-source and licensed under the ISC License.
