# 🛒 uShop — Modern E-Commerce Platform (React + TypeScript + Supabase)

[![React](https://img.shields.io/badge/React-18.0+-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3+-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3fcf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dark Mode](https://img.shields.io/badge/Theme-Dark%20Mode-000000?logo=moon&logoColor=white)](#)

uShop is a **modern full-stack e-commerce platform** built with **React, TypeScript, Vite, Supabase (PostgreSQL)**, and **ShadCN + Tailwind CSS**.  
It provides a seamless online shopping experience with role-based dashboards for **customers, vendors, and admins** — all with secure authentication and offline payment verification.

---

## 🚀 Live Demo

👉 [https://ushop-react.vercel.app](https://ushop-react.vercel.app)

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
- [Creator](#creator)

---

## ✨ Features

### 👤 Authentication
- Email/password authentication with **Supabase Auth**
- **Google Sign-In** support
- Role-based access control (Customer, Vendor, Admin)

### 🛍️ Customer Dashboard
- View and track all orders with real-time status updates
- Order history with reorder and feedback options
- Offline payment with **two-step payment verification**
- Downloadable PDF invoices
- Responsive and dark-mode-enabled interface

### 🧑‍💼 Admin Dashboard
- Manage **Products, Orders, and Users** (CRUD operations)
- Approve or decline vendor requests
- View messages submitted via contact form
- Export orders/invoices to CSV or ZIP (PDF)
- Update order status and manage payments

### 🧑‍🌾 Vendor (Seller) Dashboard
- Add and manage products (CRUD)
- Track orders for listed products
- Update order statuses for processed/completed items

### 💳 Payments
- **Offline Payment** mode (bank transfer or manual verification)
- Two-step confirmation workflow:
  1. Customer marks order as paid with transaction details
  2. Admin verifies and marks as completed

### 🌗 UI & Experience
- Built with **ShadCN + Tailwind CSS**
- Fully **responsive** and **dark-mode compatible**
- Smooth form validation using **React Hook Form + Zod**
- Reusable UI components for all views

---

## 🧰 Tech Stack

| Category | Tools / Frameworks |
|-----------|--------------------|
| Frontend | React, TypeScript, Vite |
| UI Library | ShadCN UI, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Email + Google OAuth) |
| Forms | React Hook Form, Zod |
| State Management | React Context / Hooks |
| PDF / Exports | jsPDF, FileSaver (optional) |
| Deployment | Vercel / Netlify |
| Theme | Light + Dark Mode Support |

---

## 🖼️ Screenshots

> *(Add real screenshots or GIFs later — these are placeholders)*

| Dashboard | Dark Mode | Checkout |
|------------|------------|-----------|
| ![Dashboard Screenshot](./screenshots/dashboard.png) | ![Dark Mode Screenshot](./screenshots/darkmode.png) | ![Checkout Screenshot](./screenshots/checkout.png) |

---

## ⚙️ Getting Started

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Djonahuti/ushop-react.git
cd ushop-react
```

### 2️⃣ Install Dependencies
```bash
npm install
# or
yarn install
```

### 3️⃣ Configure Environment
See [Environment Variables](#environment-variables) below.

### 4️⃣ Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and fill it like this:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=your_google_redirect_url
VITE_ADMIN_EMAIL=admin@example.com
```

> **Note:** Never commit `.env` files to GitHub — keep them private!

---

## 📁 Project Structure

```
ushop-react/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components (Home, Shop, Cart, etc.)
│   ├── dashboard/        # Role-based dashboards (Customer, Vendor, Admin)
│   ├── contexts/         # Auth and Supabase context providers
│   ├── hooks/            # Custom hooks (e.g., useAuth, useOrders)
│   ├── lib/              # Utility functions and constants
│   ├── styles/           # Tailwind and custom styles
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🧾 Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint for code checks |

---

## 🤝 Contributing

Contributions are welcome!  
If you’d like to improve uShop:

1. **Fork** this repository  
2. **Create** your feature branch (`git checkout -b feature/awesome-feature`)  
3. **Commit** your changes (`git commit -m "Add new feature"`)  
4. **Push** to your branch (`git push origin feature/awesome-feature`)  
5. **Open a Pull Request**

Please ensure all new code follows existing style conventions and passes linting.

---

## 📜 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Creator

**David Jonah**  
🌍 Lagos, Nigeria  
📧 [djonahuti@gmail.com](mailto:djonahuti@gmail.com)  
🔗 [GitHub Profile](https://github.com/Djonahuti)

> “Building modern web apps that connect people and products seamlessly.”

---

## 💖 Acknowledgments

- [Supabase](https://supabase.com/) for the backend
- [ShadCN](https://ui.shadcn.com/) for modern React UI components
- [Tailwind CSS](https://tailwindcss.com/) for fast, flexible styling
- [Vite](https://vitejs.dev/) for blazing-fast development
- Open source community for the amazing ecosystem ❤️

---
