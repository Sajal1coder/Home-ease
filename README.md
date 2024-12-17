# **Home Rental Website**


A fully functional home rental platform built using modern web technologies. This project provides users with the ability to browse property listings, register complaints, and manage their rental interactions with ease. The website incorporates secure user authentication, responsive design, and dynamic data management with payment intigration.

Features
User Authentication: Secure login and registration system using bcrypt for password encryption.


Listings: View, filter, and sort property listings based on categories and preferences.


Complaints Registration: Users can easily file and manage complaints related to their rentals.


Responsive UI: Built with HTML, CSS, SCSS, and MUI icons to ensure a clean and responsive user interface.

State Management: Utilizes Redux for managing global state across the application.

RESTful API: Backend powered by Node.js and Express to handle data interactions with MongoDB.

Data Security: User passwords are encrypted using bcrypt for added security.

Payment Integration: User can pay to homeowner with given payment system.

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
