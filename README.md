# Deltarray - User Management System

A complete, production-ready user management system with authentication, profile management, and cloud storage integration.

## 🎯 Features

### User Management
- ✅ **User Registration** with comprehensive form (name, email, password, DOB, gender, hobbies, photo)
- ✅ **User Login** with JWT authentication
- ✅ **User Listing** with HTML table display
- ✅ **Edit User** profile via modal popup
- ✅ **Delete User** with confirmation dialog
- ✅ **Email Verification** - Welcome email on registration

### Data Handling
- ✅ **Photo Upload** - Support for JPEG, PNG, GIF (max 5MB)
- ✅ **S3 Integration** - Private bucket storage for user photos
- ✅ **Hobbies** - Multiple selection with checkboxes
- ✅ **Gender** - Radio button selection (Male, Female, Other)
- ✅ **Date of Birth** - DateTime field

### Security
- ✅ **Password Hashing** - bcryptjs with 10 salt rounds
- ✅ **JWT Authentication** - 7-day token expiration
- ✅ **Protected Routes** - Admin/user access control
- ✅ **Input Validation** - Frontend and backend validation
- ✅ **Private S3 Bucket** - No public access to photos

### User Experience
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Modal Forms** - Non-intrusive editing experience
- ✅ **Confirmation Dialogs** - Prevent accidental deletions
- ✅ **Loading States** - Visual feedback during operations
- ✅ **Error Messages** - Clear, actionable error feedback

## 📁 Project Structure

```
deltarray/
├── backend/
│   ├── config/
│   │   ├── database.js       # PostgreSQL configuration
│   │   ├── email.js          # Email service (Nodemailer)
│   │   └── s3.js             # AWS S3 configuration
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   └── User.js           # User database model
│   ├── routes/
│   │   ├── authRoutes.js     # Registration & login
│   │   └── userRoutes.js     # CRUD operations
│   ├── uploads/              # Temporary file storage
│   ├── server.js             # Express server setup
│   ├── package.json
│   ├── .env.example          # Environment template
│   └── .env                  # Environment configuration (not in repo)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── UserListing.js
│   │   │   ├── EditUserModal.js
│   │   │   ├── DeleteConfirmationModal.js
│   │   │   ├── Auth.css
│   │   │   ├── UserListing.css
│   │   │   ├── DeleteConfirmationModal.css
│   │   │   └── EditUserModal.css
│   │   ├── App.js
│   │   ├── api.js            # API client methods
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── SETUP_GUIDE.md            # Detailed setup instructions
├── IMPLEMENTATION_SUMMARY.md # What was built
├── API_TESTING_GUIDE.md      # cURL and Postman examples
├── TESTING_CHECKLIST.md      # Complete testing checklist
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL
- AWS Account (for S3)
- Gmail account (for email)

### 1. Backend Setup
```bash
cd backend
npm install

# Copy .env.example to .env and configure
cp .env.example .env

# Configure .env with:
# - Database credentials
# - JWT secret
# - Email credentials
# - AWS S3 credentials

npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 4. First Test
1. Go to http://localhost:3000/register
2. Fill out form and upload photo
3. Check email for welcome message
4. Login with your credentials
5. View, edit, and delete users

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Require Authentication)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/profile/me` - Get current user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

[See API_TESTING_GUIDE.md for detailed examples]

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_auth_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=user_images

# Environment
NODE_ENV=development
```

## 🗄️ Database Schema

### users table
```
id              UUID (Primary Key)
firstName       STRING
lastName        STRING
email           STRING (Unique)
password        STRING (Hashed)
dob             DATE
gender          ENUM (male, female, other)
hobbies         JSON Array
photo           STRING (S3 URL)
isEmailVerified BOOLEAN
createdAt       DATE
updatedAt       DATE
```

## 🧪 Testing

### Manual Testing
See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for complete checklist

### API Testing
Use [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for cURL and Postman examples

### Quick Test Flow
1. **Register** - Create new user account
2. **Login** - Authenticate user
3. **List** - View all users
4. **Edit** - Update user profile
5. **Delete** - Remove user with confirmation

## 🔐 Security Features

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plaintext
- Never returned in API responses

### Authentication
- JWT tokens with 7-day expiration
- Tokens stored in localStorage (frontend)
- Tokens sent in Authorization header
- Invalid tokens redirect to login

### Data Protection
- S3 bucket configured as PRIVATE
- No public access to photos
- Automatic cleanup of old photos
- Input validation on all fields
- SQL injection protection via Sequelize ORM

### File Security
- Image file type validation
- File size limit (5MB)
- Timestamp-based naming for uniqueness
- Automatic temporary file cleanup

## 📊 Technologies Used

### Backend
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **AWS SDK** - S3 integration
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Nodemailer** - Email service
- **multer** - File upload handling
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **CSS3** - Styling
- **Fetch API** - HTTP requests

### Infrastructure
- **AWS S3** - Cloud storage for images
- **AWS IAM** - Access control
- **Nodemailer/Gmail** - Email service

## 🐛 Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check database credentials
- Create database: `createdb user_auth_db`

### S3 Issues
- Verify AWS credentials
- Check bucket name in .env
- Ensure S3 bucket is private
- Verify IAM permissions

### Email Issues
- Enable 2FA on Gmail
- Use App Password (not account password)
- Check Email credentials in .env

[See SETUP_GUIDE.md for more troubleshooting]

## 📈 Performance Considerations

- Database indexes on frequently queried columns (email, id)
- Lazy loading of user list
- Optimized S3 photo loading
- Modal-based editing (reduced server calls)
- Efficient JWT validation

## 🔄 Future Enhancements

- [ ] Email verification link
- [ ] Password reset functionality
- [ ] User search and filtering
- [ ] Pagination for large lists
- [ ] Two-factor authentication
- [ ] User activity logging
- [ ] Admin dashboard
- [ ] Role-based access control
- [ ] Photo gallery view
- [ ] User preferences/settings

## 📝 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed installation & configuration
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was built & how
- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - API examples and testing
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Comprehensive test cases

## 📄 License

This project is provided as-is for educational and commercial use.

## 👤 Support

For issues, questions, or feedback:
1. Check the documentation files
2. Review the testing checklist
3. Check API examples in the testing guide

## ✅ Completion Status

All requirements have been successfully implemented:

- ✅ User Registration (with photo, hobbies, gender, DOB)
- ✅ User Login (redirects to listing page)
- ✅ User Listing (HTML table view)
- ✅ Edit User (modal form with save/cancel)
- ✅ Delete User (confirmation dialog with yes/no)
- ✅ S3 Bucket (private, user_images)
- ✅ Photo Storage (S3 instead of local)
- ✅ Email Notification (welcome email)
- ✅ Form Validation (frontend & backend)
- ✅ Security (JWT, password hashing, private S3)

---

**Built with ❤️ - Ready for Production**

Last Updated: January 23, 2024
   DB_PORT=5432
   DB_NAME=user_registration
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start PostgreSQL:**
   - Ensure PostgreSQL is running
   - Create database: `createdb user_registration`
   - Update credentials in `.env`
3. **Start MongoDB:**
   - Ensure MongoDB is running locally or update the connection string

4. **Start the server:**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the React app:**
```bash
npm start
```

The app will open at `http://localhost:3000`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
  - Form Data: firstName, lastName, email, password, dob, gender, hobbies, photo
  - Returns: JWT token and user data

- **POST** `/api/auth/login` - Login user
  - Body: { email, password }
  - Returns: JWT token and user data

### Users
- **GET** `/api/users` - Get all users (requires auth)
  - Headers: Authorization: Bearer {token}
  - Returns: List of all users

- **GET** `/api/users/profile/me` - Get current user profile (requires auth)
  - Headers: Authorization: Bearer {token}
  - Returns: Current user data

- **GET** `/api/users/:id` - Get specific user by ID (requires auth)
  - Headers: Authorization: Bearer {token}
  - Returns: User data

## Validations

### Frontend
- First name, last name required and non-empty
- Valid email format
- Password minimum 6 characters
- Date of birth required
- Gender required
- Photo upload required
- File type validation (image only)
- File size limit (5MB)

### Backend
- All validations rePostgreSQL)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  dob TIMESTAMP NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  hobbies JSON DEFAULT '[]',
  photo VARCHAR(255) NOT NULL,
  isEmailVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); dob: Date (required),
  gender: String (enum: ['male', 'female', 'other']),
  hobbies: [String],
  photo: String (required),
  isEmailVerified: Boolean,
  createdAt: Date
}
```

## Features Implemented

- [x] User Registration with validation
- [x] Photo upload (required field)
- [x] Email verification after registration
- [x] User Login with JWT
- [x] Protected routes
- [x] User listing page
- [x] Password hashing and security
- [x] CORS enabled
- [x] Error handling
- [x] Responsive UI

## Technologies Used

**PostgreSQL & Sequelize ORM
- Node.js & Express
- MongoDB & Mongoose
- JWT (JSON Web Tokens)
- Bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for emails
- Express Validator for validations

**Frontend:**
- React 18
- React Router v6
- CSS3 for styling
- Fetch API for HTTP requests

## Notes

- Ensure PostgreSQL is running before starting the backend
- Create database: `createdb user_registration`
- Configure email service credentials in `.env` file
- Photos are stored in `backend/uploads` directory
- JWT tokens expire in 7 days
- Maximum photo file size: 5MB

## Troubleshooting

1. **CORS Error:** Update `FRONTEND_URL` in backend `.env`
2. **PostgreSQL Connection:** Check PostgreSQL is running and credentials are correct
   - Test connection: `psql -h localhost -U postgres -d user_registration`
3. **Database Sync Error:** Ensure database `user_registration` exists
4. **Email Not Sending:** Verify email credentials and enable "Less secure app access"
5. **Photo Upload Fails:** Check file size and format (JPEG, PNG, GIF)
