<div align="center">

# 🛍️ EveryWear — Redefining Men's Wearing Style

> A production-oriented e-commerce backend built with **Node.js, Express.js, MongoDB, and Mongoose**.

</div>

**EveryWear** is a complete backend system for an online men's fashion store — handling authentication, product management, collections/categories, cart, orders, reviews, image uploads, transactional emails, and admin operations.

The frontend is not yet implemented; this project focuses entirely on the REST API and backend architecture.

---

## 1. Project Overview

EveryWear goes beyond basic CRUD, implementing real-world e-commerce backend workflows with separate capabilities for **customers** and **administrators**, secured through authentication and authorization.

### 1.1 Core Areas

<div align="center">

| Feature | Description |
|---|---|
| 🔐 **Auth & Authorization** | Secure login, sessions & role-based access |
| 👤 **Account Management** | User profiles & customer data |
| 🛍️ **Products** | Catalog management with images & variants |
| 🗂️ **Collections & Categories** | Hierarchical product organization |
| 🛒 **Cart** | Add, update, and manage cart items |
| 📦 **Orders** | Full order lifecycle from placement to delivery |
| ⭐ **Reviews & Ratings** | User feedback tied to products & orders |
| 🖼️ **Image Uploads** | Powered by Cloudinary |
| 📧 **Transactional Emails** | Powered by Resend |
| 🛡️ **Security & Rate Limiting** | Protection against abuse |
| ✅ **Validation** | Centralized request validation |
| 📊 **Admin Statistics** | Dashboard-ready order & sales data |
| 🗄️ **Data Modeling** | MongoDB schemas via Mongoose |

</div>

---


## 2. Authentication & User Management

A complete auth workflow with protected, role-based routes.

### 2.1 Features

- Registration
- Email OTP verification (with expiry & resend)
- Login/Logout
- Access & refresh tokens
- Profile image upload/edit/delete
- Password reset OTP
- Role-based access (customer/admin)
- Auth & admin middleware
### 2.2 Roles
```text
customer
admin
```

---

## 3. Security

* JWT auth with refresh tokens
* bcrypt password hashing
* Helmet, CORS, MongoDB sanitization
* Express rate limiting (dedicated limits for register/login/OTP/refresh)
* Request validation via Express Validator
* Environment-based configuration

---

## 4. Product Management

Products are organized under a collection/category hierarchy.

### 4.1 Operations
Retrieve all/by category/by collection · Create under collection or category · Edit/Delete · Upload, add, and delete images (Cloudinary)

Admin product routes follow: `Authentication → Admin Authorization → Validation → Controller`

---

## 5. Collections & Categories

```text
Collection
   ├── Category
   │      └── Products
   └── Products
```

* **Collection:** name, slug, category availability, active status
* **Category:** collection reference, name, slug, active status

---

## 6. Shopping Cart

Authenticated customers can add items (with size & quantity), view, update, remove, or clear their cart. Cart is linked to the user and references products via ObjectId.

---

## 7. Order Management

Orders store purchase-time data rather than relying on live product info.

### 7.1 Features
Create orders · Unique order IDs · Retrieve customer/order details · Cancel orders · Admin order management & status updates · Dashboard recent orders & statistics · Filtering, sorting, date-range queries

### 7.2 Order Data
* **Items:** product ref, name, image, price & discounted price at purchase, size, quantity
* **Shipping:** name, email, phone, country/province/city, address, postal code
* **Billing:** subtotal, discount, shipping, tax, grand total
* **Payment methods:** `cash_on_delivery`, `stripe`, `paypal`, `jazzcash`, `bank_transfer`
* **Payment status:** `pending`, `completed`, `failed`, `refunded`

### 7.3 Order Lifecycle
```text
pending → confirmed → processing → packed → shipped → outForDelivery → delivered
```
Also supports: `cancelled`, `returned`, `refunded`

### 7.4 Order Cancellation
Includes reason, description, cancelling user, and date. Reasons include changed mind, mistake, price found elsewhere, slow delivery, no longer needed, other.

---

## 8. Product Reviews & Ratings

Linked to user, product, and order.

### 8.1 Features
Create/update/delete own reviews · Upload review images · Retrieve product reviews · Admin review management/deletion · 1–5 rating, title, description

Unique compound index: `user + product + order` (prevents duplicate reviews).

---

## 9. Image Management

Cloudinary handles storage for profile, product, and review images. **Multer** processes multipart uploads before passing to the image service. Product images support multi-upload, adding more, and individual deletion.

---

## 10. Email System

**Resend** powers transactional emails, with templates separated from controllers:
```text
Controller → Email Service → Email Template → Resend → Recipient
```
Templates split into `email-templates/auth/` and `email-templates/orders/`.

---

## 11. Request Validation

**Express Validator** with dedicated validator files per resource (auth, category, collection, orders, product, reviews), processed through a centralized validation middleware.

Typical flow: `Rate Limiter → Authentication → Authorization → Validator → Validation Middleware → Controller`

---

## 12. Admin Operations

Includes product/order/review management, order status updates & statistics, and recent-order dashboards — protected via `isAuthenticated → isAdmin`.

---

## 13. Database Architecture

### 13.1 Models
`User · Collection · Category · Product · Cart · Order · Review`

### 13.2 Relationships
```text
User → Cart, Orders (→ Order Items → Product), Reviews (→ Product, Order)
Collection → Category → Product
```

### 13.3 Indexing
* **Order:** user, paymentStatus, paymentMethod, province, city, createdAt
* **Review:** user+product+order (unique), product+createdAt
* **Cart:** user

---

## 14. Backend Architecture

```text
Routes → Middleware → Validators → Controllers → Models → MongoDB
```

| Layer | Responsibility |
|---|---|
| Routes | API endpoints |
| Controllers | Business logic |
| Models | MongoDB schemas |
| Validators | Request validation |
| Middleware | Auth, authorization, rate limiting |
| Services | External integrations |
| Utils | Reusable helpers |
| Config | DB & third-party config |

---

## 15. Project Structure

```text
Everywear/backend/
├── config/            (db.js, resend.js)
├── controllers/        (auth, cart, category, collection, orders, product, reviews)
├── email-templates/    (auth/, orders/)
├── middlewares/        (auth/, rate-limits/, multer.js, validate.js)
├── models/              (cart, category, collection, orders, product, reviews, user)
├── routes/              (auth, cart, category, collection, order, product, reviews)
├── services/            (cloudinary.js, resendEmail.js)
├── uploads/
├── utils/                (orders/, api-error.js, api-response.js, async-handler.js, generateTokens.js)
├── validators/           (per-resource validators)
├── .env / .gitignore / package.json / server.js
```


---


## 16. Tech Stack

| Category | Badges |
|---|---|
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js%205-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white) |
| **Auth & Security** | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/bcrypt-338833?style=for-the-badge&logo=letsencrypt&logoColor=white) ![Helmet](https://img.shields.io/badge/Helmet-49C5B6?style=for-the-badge&logo=helmet&logoColor=white) ![CORS](https://img.shields.io/badge/CORS-FF6B6B?style=for-the-badge) ![Express Rate Limit](https://img.shields.io/badge/Rate%20Limit-000000?style=for-the-badge&logo=express&logoColor=white) ![Mongo Sanitize](https://img.shields.io/badge/Mongo%20Sanitize-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Cookie Parser](https://img.shields.io/badge/Cookie%20Parser-F7DF1E?style=for-the-badge&logo=cookiecutter&logoColor=black) |
| **Validation** | ![Express Validator](https://img.shields.io/badge/Express%20Validator-000000?style=for-the-badge&logo=express&logoColor=white) |
| **Files & Images** | ![Multer](https://img.shields.io/badge/Multer-FF6600?style=for-the-badge) ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white) |
| **Email** | ![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white) |
| **Dev Tools** | ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white) ![Morgan](https://img.shields.io/badge/Morgan-000000?style=for-the-badge) ![Chalk](https://img.shields.io/badge/Chalk-FFFFFF?style=for-the-badge&logo=chalk&logoColor=black) ![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black) |
---

## 17. Installation

```bash
git clone <your-repository-url>
cd Everywear/backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
```

---

## 18. Running the Project

```bash
npm run dev     # Development (Nodemon)
npm start       # Production
```

---

## 19. API Modules

```text
/api/auth  /api/cart  /api/products  /api/reviews  /api/categories  /api/collections  /api/orders
```

### 19.1 Auth

| Method | Endpoint |
|---|---|
| POST | `/register` |
| POST | `/verify-otp` |
| POST | `/login` |
| POST | `/logout` |
| POST | `/upload-profile-image` |
| PUT | `/edit-profile-image` |
| DELETE | `/delete-profile-image` |
| POST | `/refresh-access-token` |
| POST | `/resend-otp` |

### 19.2 Cart

| Method | Endpoint |
|---|---|
| POST | `/add-to-cart/:productId` |
| GET | `/` |
| PATCH | `/update-cart/:itemId` |
| DELETE | `/remove-from-cart/:itemId` |
| DELETE | `/clear-cart` |

### 19.3 Products

| Method | Endpoint |
|---|---|
| GET | `/` |
| GET | `/category/:categoryId` |
| GET | `/collection/:collectionId` |
| POST | `/collections/:collectionId` |
| POST | `/categories/:categoryId` |
| PATCH | `/:productId` |
| DELETE | `/:productId` |
| POST | `/:productId/images` |
| DELETE | `/:productId/images/:imageId` |

### 19.4 Reviews

| Method | Endpoint |
|---|---|
| POST | `/create-review/:productId/:orderId` |
| DELETE | `/delete-review/:productId/:reviewId` |
| GET | `/get-product-reviews/:productId` |
| PATCH | `/update-review/:productId/:reviewId` |
| DELETE | `/delete-review-by-admin/:productId/:reviewId` |
| GET | `/get-product-reviews-for-admin` |

### 19.5 Orders

| Method | Endpoint |
|---|---|
| POST | `/create-order` |
| PATCH | `/cancel-order/:orderId` |
| PATCH | `/update-order-status/:orderId` |
| GET | `/get-user-orders` |
| GET | `/get-order-details/:orderId` |
| GET | `/get-order-details-for-user/:orderId` |
| GET | `/get-recent-orders-for-dashboard` |
| GET | `/get-order-statistics` |
| GET | `/get-all-orders-for-admin` |
---

## 20. Utility Layer

**General:** api-error.js, api-response.js, async-handler.js, capitalizeName.js, generateTokens.js
**Orders:** build-order-filters.js, build-sort-options.js, generate-order-id.js, get-date-range.js

---

## 21. API Testing

Testable via Postman, Insomnia, Thunder Client, or any frontend client — no frontend implemented yet.

---

## 22. Future Improvements

Planned enhancements to extend EveryWear beyond its current backend-only scope:

-  🖥️ **Customer Frontend** — Full storefront UI for browsing, cart, and checkout
-  📊 **Admin Dashboard Frontend** — Visual interface for the existing admin APIs
- 💳 **Complete Payment Integration** — Live Stripe/PayPal/JazzCash processing
- 🔍 **Advanced Product Search** — Full-text and fuzzy search support
- 🎯 **Advanced Filtering** — Multi-attribute filters (price, size, rating, etc.)
- 📦 **Inventory Management** — Stock tracking and low-stock alerts
- ❤️ **Wishlist** — Save-for-later functionality per user
-  🎟️ **Coupons & Promo Codes** — Discount code engine for checkout
- 📈 **Advanced Analytics** — Deeper sales, customer, and product insights
- 🧪 **Automated API Testing** — Unit and integration test coverage
- 🚀 **Production Deployment** — CI/CD pipeline and live hosting
---
## 23. Project Goals

EveryWear was built as a deep dive into real-world backend engineering — going beyond simple CRUD to practice the patterns that power production-grade APIs.

**Core concepts practiced:**

| Area | Focus |
|---|---|
| 🌐 **API Design** | RESTful architecture & modular routing |
| 🔐 **Auth & Authorization** | JWT, refresh tokens, role-based access control |
| 🗄️ **Data Modeling** | MongoDB schema design with Mongoose relationships |
| 📦 **Order Lifecycle** | End-to-end state management from placement to delivery |
| ✅ **Validation** | Centralized request validation with Express Validator |
| 🛡️ **Rate Limiting** | Abuse prevention on sensitive endpoints |
| 🖼️ **File Uploads** | Multer + Cloudinary integration |
| 📧 **Transactional Emails** | Templated, service-layer email architecture |
| 📊 **Admin Workflows** | Role-protected management operations |
| ⚡ **Indexing** | Query optimization for high-traffic fields |
| 🧩 **Modular Architecture** | Clean separation of routes, controllers, services & utils |

</br>

> The goal wasn't just to make it work — it was to make it *scalable, secure, and maintainable*.
---
---

## 24. Author

<div align="center">

### 👨‍💻 Fawad Ahmad
**Computer Science Student & Web Developer**

Passionate about building modern, scalable web applications — focused on **JavaScript, Node.js, Express.js, MongoDB, and React**. Always exploring backend architecture, system design, and clean code practices.

📫 *Open to connecting, collaborating, or hearing your feedback on this project.*

[![Portfolio](https://img.shields.io/badge/Portfolio-181717?style=for-the-badge&logo=vercel&logoColor=white)](https://fawad-ahmad-168-portfolio.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)]([https://linkedin.com/in/your-profile](https://www.linkedin.com/in/fawad-ahmad-b9a286319/))
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:fawadahmad0059@gmail.com)

</div>

---

## 25. License

This project is licensed under the **ISC License** .

---

<div align="center">

## ⭐ Enjoyed This Project?

If **EveryWear** helped you learn something, sparked an idea, or you'd simply like to see it grow —
consider giving it a **star** on GitHub. It genuinely helps and motivates continued development. 🙌

**More features and the frontend are on the way — stay tuned! 🚀**

<br>

*Thanks for stopping by. Built with 🖤 and countless cups of coffee ☕*

</div>
