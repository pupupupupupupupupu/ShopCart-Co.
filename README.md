🛒 ShopCart Co. – Full Stack Shopping Application
📌 Overview

ShopCart Co. is a full-stack e-commerce web application built to demonstrate real-world shopping platform functionality. Users can browse products freely without logging in, search and filter products, and view product details in a clean and simple interface. Authentication is required only when users want to add products to the cart or manage their account, keeping the experience smooth and user-friendly.

The application supports user and admin roles. Regular users can register, log in, and manage their cart, while admins can add new products, upload multiple product images, update product details, manage users, and view basic platform statistics. The goal of this project is to go beyond a basic MVP and showcase a complete, secure, and scalable shopping application.

⚙️ Technical Details
Frontend

Built using React + TypeScript with Vite for fast development

React Router for client-side routing

Public, protected, and admin-only routes using custom route guards

React Context + custom hooks for authentication and cart state

Persistent UI state with loading and error handling

Environment-based API configuration using .env

Backend

Built with Node.js and Express

MongoDB + Mongoose for database management

JWT authentication with:

Short-lived access tokens

Refresh tokens stored in HTTP-only cookies

Role-based access control (User / Admin)

CORS whitelist with credential support

Rate limiting to protect authentication endpoints

Centralized error handling and request logging

Product & Media Handling

Product CRUD operations for admins

Image upload using Multer and Cloudinary

Validation for image type, size, and count (1–5 images per product)

Soft delete support for products

Cart & Orders

Persistent cart stored in the database

Cart automatically restored after login

Cart cleared after order creation

Order system implemented and ready for future payment integration

🔐 Key Features

User registration and login

Secure JWT authentication with refresh tokens

Role-based admin dashboard

Product search, pagination, and filtering

Persistent shopping cart

Admin user management

Clean and scalable project structure

Production-ready security practices
