# Car Rental Management System

The Car Rental Management System is designed to streamline the process of renting cars. It provides an intuitive interface for customers to browse available cars, make bookings, and process payments, while also offering robust administrative tools for managing the car fleet, bookings, and user accounts.

## Features

### Customer Features
- **Car Browsing**: View all available cars with detailed specifications and pricing
- **Car Details**: Detailed view of each car with images and specifications
- **Booking System**: Easy-to-use booking form for selecting rental dates and options
- **User Authentication**: Secure login and registration system
- **User Dashboard**: View booking history and manage profile
- **Payment Processing**: Secure payment gateway integration
- **Feedback System**: Submit feedback about rental experiences

### Admin Features
- **Dashboard**: Overview of key metrics like total bookings, revenue, and popular cars
- **Car Management**: Add, edit, and remove cars from the fleet
- **Booking Management**: View and manage all bookings
- **User Management**: Manage user accounts and permissions

## Tech Stack

- **Frontend**: React, Next.js
- **Styling**: CSS Modules, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kankithkumar/car-rental.git
   cd car-rental
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `components/`: Reusable React components
- `pages/`: Next.js pages and API routes
- `public/`: Static assets
- `styles/`: CSS modules for styling
- `utils/`: Utility functions and helpers
