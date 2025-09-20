Backend

1) Create a .env file in this folder with:
- MONGODB_URI=mongodb://127.0.0.1:27017/inventory
- PORT=4000
- JWT_SECRET=change_me_in_production

2) Install and run:
- npm install
- npm run dev

Auth Endpoints
- POST /api/auth/register { fullName, email, password, role? }
- POST /api/auth/login { email, password }


