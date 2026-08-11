# Mellosoft E-Commerce & Admin Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

**Mellosoft** is a modern, high-performance e-commerce platform for luxury mattresses, pillows, and sleep accessories. It features a consumer-facing storefront alongside a role-based management admin portal.

---

## 🌟 Key Features

### 🛍️ Consumer Storefront (`/`)
* **Interactive Hero Slider**: Highlights featured mattresses and promotional offers.
* **Product Catalog & Sizing Configurator**: Sizing options (`Twin`, `Full`, `Queen`, `King`) and firmness tiers (`Soft`, `Medium`, `Firm`) with dynamic price calculations.
* **Shopping Cart & Wishlist**: Real-time cart updates, shipping threshold logic, and wishlist manager.
* **AI Sleep Advisor**: Questionnaire analyzing sleep positions and body temperature preferences.
* **Live Discovery Search**: Auto-focus search bar returning results across products, categories, and tags.

### 🛡️ Admin Portal (`/admin`)
* **Role-Based Access Control (RBAC)**: Super Admin, Admin, Manager, and Staff roles with granular module permissions.
* **Relational Data Architecture**: Single source of truth linking Customers, Orders, Products, and Wishlists via unique IDs.
* **Interactive Orders Management**: Clickable order rows, status management modal, and Payment (`Paid`, `Pending`, `Failed`, `Refunded`) & Order status (`Pending`, `Processing`, `Delivered`, `Cancelled`) updates.
* **Customer Profile & Purchase Analytics**: Clickable customer rows opening detailed customer profile panels with dynamic purchase insights, order history, and wishlists.
* **Mobile-Responsive Admin Cards**: Fully responsive user cards and order controls designed for mobile viewports (`<= 768px`).

---

## 📁 Documentation Links

* [PROJECT_DOCUMENTATION.md](file:///c:/Users/BAHRATHRAJ%20M/OneDrive/Documents/Mellosoft/mellosoft/PROJECT_DOCUMENTATION.md) – Full system architecture, directory structure, data models, RBAC, and admin features documentation.
* [WEBSITE_DOCUMENTATION.md](file:///c:/Users/BAHRATHRAJ%20M/OneDrive/Documents/Mellosoft/mellosoft/WEBSITE_DOCUMENTATION.md) – Storefront design system and view components documentation.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gohut/mellosoft.git
   cd mellosoft/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Access the application in your browser:
   * **Storefront**: [http://localhost:3000](http://localhost:3000)
   * **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, Recharts, Lucide React
* **State & Data**: React Context API (`StoreContext.js`, `AdminContext.js`, `AdminAuthContext.js`) with `localStorage` synchronization
* **Styling**: Pure CSS-in-JS & Scoped/Global Vanilla CSS