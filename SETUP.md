# Inventory System Setup

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/inventory
   JWT_SECRET=your_jwt_secret_here
   PORT=4000
   ```

4. Start MongoDB (make sure MongoDB is running on your system)

5. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:4000`

## Frontend Setup

1. Navigate to the root directory (where package.json is located)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Features

### Backend API Endpoints

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Items**: `/api/items` (GET, POST, PUT, DELETE)
- **Suppliers**: `/api/suppliers` (GET, POST, PUT, DELETE)
- **Stock Transactions**: `/api/stock` (GET, POST, PUT, DELETE)
- **Dashboard**: `/api/dashboard/overview`

### Frontend Pages

- **Dashboard**: Overview with metrics and recent activity
- **Items**: Inventory management with search and filtering
- **Suppliers**: Supplier management
- **Stock**: Stock transactions (inbound/outbound/adjustments)
- **Reports**: Analytics and reporting
- **Settings**: Application configuration

## Database Models

- **User**: Authentication and user management
- **Item**: Inventory items with SKU, pricing, and stock levels
- **Supplier**: Supplier information and contact details
- **StockTransaction**: All stock movements and adjustments

## Authentication

The system uses JWT tokens for authentication. Users must be logged in to access the admin panel. The token is stored in localStorage and sent with each API request.
