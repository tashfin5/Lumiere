# Lumiere E-Commerce Platform

**Live Demo:** [https://lumiereog.com](https://lumiereog.com)

Lumiere is a full-stack, responsive e-commerce web application featuring a modern storefront and a comprehensive admin dashboard. 

## 🚀 Features

### Customer Storefront
- **Product Browsing & Search**: Explore products by categories, brands, and special offers.
- **Shopping Cart & Checkout**: Integrated order management flow.
- **User Accounts**: Registration, login, and profile management.
- **Dynamic UI**: Smooth animations and responsive design.

### Admin Dashboard
- **Product Management**: Full CRUD capabilities for products, including image uploads.
- **Category & Brand Management**: Organize the catalog efficiently.
- **Order Tracking**: Monitor and update order statuses.
- **Promotions**: Create and manage special offers.
- **Site Analytics**: View user and sales statistics.

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: [Next.js 15+](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **HTTP Client**: Axios

### Backend (`/server`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: [Cloudinary](https://cloudinary.com/) (via Multer)

## 📦 Project Structure

```text
Lumiere/
├── client/                 # Next.js frontend application
│   ├── app/                # App router (storefront & admin pages)
│   ├── components/         # Reusable React components
│   ├── store/              # Zustand state stores
│   └── utils/              # Helper functions
└── server/                 # Express API backend
    ├── config/             # Database & app configuration
    ├── controllers/        # Request handlers
    ├── middleware/         # Auth & Error handling middlewares
    ├── models/             # Mongoose schemas (User, Product, Order, etc.)
    └── routes/             # API route definitions
```

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and configure the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
Run the backend server:
```bash
npm start
```

### 2. Frontend Setup
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
```
Run the frontend development server:
```bash
npm run dev
```
The storefront will be available at `http://localhost:3000`.

## 📄 License
This project is licensed under the ISC License.
