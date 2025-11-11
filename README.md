# 🛒 uShop — Modern E-Commerce Platform (React + TypeScript + PHP API)

[![React](https://img.shields.io/badge/React-18.0+-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3+-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PHP](https://img.shields.io/badge/API-PHP%208+-777bb4?logo=php&logoColor=white)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dark Mode](https://img.shields.io/badge/Theme-Dark%20Mode-000000?logo=moon&logoColor=white)](#)

uShop is a **modern full-stack e-commerce platform** built with **React, TypeScript, Vite, and a custom PHP/PostgreSQL API** (deployable on cPanel).  
It provides a seamless online shopping experience with role-based dashboards for **customers, vendors, and admins** — complete with offline payment verification and file uploads stored under your domain.

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
- Email/password authentication handled via the custom PHP API
- Session persisted in local storage for role-based access (Customer, Vendor, Admin)

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
- Update order status and manage payments through the PHP API

### 🧑‍🌾 Vendor (Seller) Dashboard
- Add and manage products (CRUD)
- Track orders for listed products
- Update order statuses for processed/completed items

### 💳 Payments
- **Offline Payment** mode (bank transfer or manual verification)
- Two-step confirmation workflow managed entirely by the PHP API:
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
| Backend API | PHP 8+, custom endpoints (deployable on cPanel) |
| Database | PostgreSQL (cPanel managed) |
| Authentication | PHP session/token workflow + local storage |
| Forms | React Hook Form, Zod |
| State Management | React Context / Hooks |
| PDF / Exports | jsPDF, FileSaver (optional) |
| Deployment | GitHub Actions → FTP (frontend) + cPanel (API) |
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

## 📦 Deploying to cPanel (FTP-Only Hosting)

### Automatic Deployment via GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys:
- React frontend (`dist/`) to `public_html/`
- PHP API (`api/`) to `public_html/api/`
- Mail system (`mail/`) to `public_html/mail/`

**Required GitHub Secrets:**
- `FTP_SERVER` - Your FTP server address
- `FTP_USERNAME` - Your FTP username
- `FTP_PASSWORD` - Your FTP password
- `FTP_PROTOCOL` - Usually `ftp` or `ftps`
 
### Manual Setup Steps (One-Time)

Since FTP-only hosting doesn't support SSH commands, you need to manually create the uploads directory:

1. **Create uploads directory via cPanel File Manager:**
   - Log into your cPanel
   - Open **File Manager**
   - Navigate to `public_html/`
   - Create a new folder named `uploads`
   - Right-click the `uploads` folder → **Change Permissions** → Set to `755` (or `777` if needed for write access)

2. **Configure database credentials:**
   - Edit `api/config.php` to match your cPanel PostgreSQL credentials:
     - `$dbHost` (usually `localhost` on shared hosting)
     - `$dbName` (your database name)
     - `$dbUser` (your database username)
     - `$dbPass` (your database password)

3. **Verify file structure on server:**
   ```
   public_html/
   ├── index.html (from dist/)
   ├── assets/ (from dist/)
   ├── api/
   │   ├── config.php
   │   └── ... (other API files)
   ├── mail/
   │   └── ... (mail system files)
   └── uploads/ (manually created, permissions: 755)
   ```

4. **Test the deployment:**
   - Visit your domain to see the React app
   - Check `https://your-domain.com/api/products.php` to verify the API is working
   - Upload a product image to test the uploads directory

**Note:** The `uploads/` directory is listed in `.gitignore` for local development, but must exist on the server. Uploaded media will be accessible via `https://your-domain.com/uploads/<file>`.

---

## 🔐 Environment Variables

The current frontend no longer requires Supabase keys.  If you use optional 3rd-party integrations (e.g. PayPal), add them to a `.env` file and consume via `import.meta.env` as usual.  Otherwise, the key configuration lives in `api/config.php` on the server.

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
│   ├── contexts/         # Auth and application context providers
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

- [ShadCN](https://ui.shadcn.com/) for modern React UI components
- [Tailwind CSS](https://tailwindcss.com/) for fast, flexible styling
- [Vite](https://vitejs.dev/) for blazing-fast development
- [PHPMailer](https://github.com/PHPMailer/PHPMailer) for email functionality
- Open source community for the amazing ecosystem ❤️

---
