# **HomeEase - Modern Home Rental Platform**

<img width="1914" height="910" alt="Screenshot 2025-11-10 210920" src="https://github.com/user-attachments/assets/1e26b711-fb2e-443e-b128-a5529ec52cd1" />


A production-ready, full-stack home rental platform built with cutting-edge technologies. HomeEase provides a comprehensive solution for property rentals, featuring AI-powered assistance, real-time messaging, advanced analytics, and seamless payment processing.

## 🖼️ **Screenshots**
<img width="1920" height="1080" alt="Screenshot (14)" src="https://github.com/user-attachments/assets/750c62bb-cfe0-4f0b-89d6-221cd2ed87d9" />
<img width="1920" height="1080" alt="Screenshot (15)" src="https://github.com/user-attachments/assets/6f3ea4c9-6880-4d45-b62a-ae2790695b05" />
<img width="1920" height="1080" alt="Screenshot (16)" src="https://github.com/user-attachments/assets/b294f45d-3f39-454c-9a48-38dcc5cd813c" />
<img width="1920" height="1080" alt="Screenshot (17)" src="https://github.com/user-attachments/assets/1aa569a9-82ff-4452-92c9-c078ae65ff95" />

---

## ✨ **Core Features**

### 🔐 **User Management**
- **Secure Authentication**: JWT-based authentication with bcrypt password encryption
- **User Profiles**: Comprehensive profile management with photo uploads
- **Email/Phone Verification**: Multi-level verification system
- **User Dashboard**: Personalized dashboard for bookings, listings, and wishlist
- **Government ID Verification**: Secure identity verification for hosts

### 🏠 **Property Management**
- **Dynamic Listings**: Browse, filter, and sort properties by multiple criteria
- **Advanced Search**: Category-based filtering with real-time results
- **Property Verification**: Admin-verified listings for trust and safety
- **Image Gallery**: Multiple photo uploads with lazy loading
- **Wishlist**: Save and manage favorite properties

### 💳 **Booking & Payments**
- **Stripe Integration**: Secure payment processing
- **Booking Management**: Create, view, and track bookings
- **Cancellation System**: Request and manage booking cancellations
- **Payment History**: Complete transaction records
- **Refund Processing**: Automated refund handling

### ⭐ **Review & Rating System**
- **Detailed Reviews**: Multi-criteria rating system (cleanliness, accuracy, location, etc.)
- **Photo Reviews**: Upload photos with reviews
- **Host Responses**: Property owners can respond to reviews
- **Verified Reviews**: Only completed bookings can leave reviews
- **Review Moderation**: Admin approval system for quality control
- **Helpful Votes**: Community-driven review ranking

### 💬 **Real-time Communication**
- **Socket.io Messaging**: Instant messaging between users and hosts
- **Message History**: Persistent conversation storage
- **Online Status**: Real-time presence indicators
- **Typing Indicators**: Enhanced user experience
- **Notification System**: In-app and email notifications

### 🤖 **AI-Powered Chatbot**
- **RAG (Retrieval-Augmented Generation)**: Context-aware responses using Google Gemini AI
- **Vector Search**: Qdrant-powered semantic search across FAQs
- **N8n Workflows**: Automated conversation handling
- **24/7 Support**: Instant answers to common questions
- **Navigation Assistance**: Guide users to the right pages
- **Beautiful UI**: Modern, responsive chat widget

### 👨‍💼 **Admin Dashboard**
- **Analytics Dashboard**: Revenue tracking, user growth, and property statistics
- **User Management**: Verify, block, or manage user accounts
- **Property Verification**: Approve or reject property listings
- **Review Moderation**: Monitor and moderate user reviews
- **Booking Overview**: Track all platform bookings
- **System Stats**: Real-time platform metrics

### 📱 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with SCSS styling
- **Material-UI Icons**: Professional icon library
- **Framer Motion**: Smooth animations and transitions
- **Canvas Confetti**: Celebration effects for milestones
- **Error Boundaries**: Graceful error handling
- **Lazy Loading**: Optimized image loading
- **React Toastify**: Beautiful notification system

## **Tech Stack**
**Frontend**:

HTML5, CSS3, SCSS

JavaScript (ES6+)

React (with Redux for state management)

MUI Icons (for modern UI elements)

**Backend:**

Node.js (with Express framework)

MongoDB (for database management)

bcrypt (for secure password hashing)

Stripe API for payment Integration

## **Pages**

Home: Overview of the platform and key features.

Listings: Explore rental properties with sorting and filtering options.

Complaint Registration: A form for users to submit and track rental-related complaints.

Profile Management: Users can view and update their personal details.

Getting Started

### To set up the project locally:

**Clone the repository:**


git clone [https://github.com/Sajal1coder/home-rental-website.git](url)

### **Install dependencies:**


[cd home-rental-website](url)

[npm install](url)

### **Start the development server:**


[npm start](url)

Set up environment variables for the backend (e.g., MongoDB connection, JWT secret).

### Add .env file in server subfile
following variables must be filled:
MONGO_URI

JWT_SECRET

STRIPE_PUBLISHABLE_KEY

STRIPE_SECRET_KEY

