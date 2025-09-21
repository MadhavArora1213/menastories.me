# Magazine Website Backend

A comprehensive backend API for a magazine website built with Node.js, Express, and PostgreSQL using Sequelize ORM.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Category Management** - CRUD operations with dynamic design layouts
- **Article Management** - Content creation and management
- **Media Management** - File uploads and media handling
- **Newsletter System** - Email subscription management
- **Admin Dashboard** - Comprehensive admin controls
- **Security** - Helmet, CORS, XSS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Upload**: Express-fileupload
- **Validation**: Express-validator
- **Security**: Helmet, XSS-clean

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Magazine_Website/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=magazine_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=24h
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email (Brevo)
   BREVO_API_KEY=your_brevo_api_key
   
   # Cloudinary (for media uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Database Setup**
   ```bash
   # Initialize database tables
   npm run init-db
   
   # Clean up any existing roles (if you have duplicate roles)
   npm run cleanup-roles
   
   # Seed initial data
   npm run seed-content
   npm run seed-categories
   npm run init-features
   npm run seed-admins
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database tables
- `npm run seed-content` - Seed sample content data
- `npm run seed-categories` - Seed sample category data
- `npm run init-features` - Initialize special features
- `npm run update-category-schema` - Update category table schema
- `npm run seed-admins` - Seed admin users with roles
- `npm run cleanup-roles` - Clean up duplicate roles
- `npm run reset-db` - Reset database (cleanup + seed admins)

## Role System

The system uses **10 roles** with specific permissions based on the `initializeDb.js` structure:

### 1. Master Admin
- **Full system control**, user management, site configuration
- **Default credentials**: admin@magazine.com / Admin@123

### 2. Webmaster
- **Technical management**, site maintenance, performance optimization

### 3. Content Admin
- **Content oversight**, publishing schedule, category management
- **Default credentials**: content@magazine.com / Content@123

### 4. Editor-in-Chief
- **Editorial decisions**, content strategy, quality standards
- **Default credentials**: editor@magazine.com / Editor@123

### 5. Section Editors
- **Category specialists**, content curation, writer coordination

### 6. Senior Writers
- **Feature articles**, investigative pieces, major interviews

### 7. Staff Writers
- **Regular content creation**, daily articles, event coverage

### 8. Contributors
- **Guest articles**, specialized content, expert opinions

### 9. Reviewers
- **Fact checking**, content verification, quality assurance

### 10. Social Media Manager
- **Digital presence**, social engagement, content promotion

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/register` - Admin registration
- `POST /api/admin/auth/logout` - Admin logout

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PATCH /api/categories/:id/status` - Toggle status
- `PATCH /api/categories/:id/design` - Update design

### Articles
- `GET /api/content` - Get all articles
- `POST /api/content` - Create new article
- `PUT /api/content/:id` - Update article
- `DELETE /api/content/:id` - Delete article

### Media
- `GET /api/media` - Get all media files
- `POST /api/media/upload` - Upload media file
- `DELETE /api/media/:id` - Delete media file

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## Category Management

The category system supports three different design layouts:

### Design 1: Modern Card Layout
- Grid-based card display
- Hover animations
- Status badges
- Modern icons

### Design 2: Clean Table Layout
- Professional table design
- Compact view
- Easy scanning
- Organized information

### Design 3: Glassmorphism
- Backdrop blur effects
- Gradient overlays
- Premium aesthetics
- Modern glass-like appearance

### Category Fields
- `name` - Category name (required)
- `slug` - URL-friendly identifier (auto-generated)
- `description` - Category description
- `design` - Layout design (design1, design2, design3)
- `status` - Active/inactive status
- `featureImage` - Hero image URL
- `parentId` - Parent category for hierarchies
- `order` - Display order
- `isActive` - System-level active status

## Database Schema

The backend uses PostgreSQL with the following main tables:

- **Categories** - Magazine categories with design layouts
- **Articles** - Content articles
- **Users** - System users and admins
- **Media** - File uploads and media
- **Roles** - User roles and permissions (exactly 3 roles)
- **Newsletters** - Email subscriptions

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Admin and user permissions
- **Input Validation** - Request data validation
- **XSS Protection** - Cross-site scripting prevention
- **CORS Configuration** - Cross-origin resource sharing
- **Helmet Security** - Security headers

## File Structure

```
Backend/
├── config/           # Database configuration
├── controllers/      # Route controllers
├── docs/            # API documentation
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Database scripts
├── services/        # Business logic services
├── utils/           # Utility functions
├── validations/     # Validation schemas
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

## Development

### Adding New Features
1. Create the model in `models/`
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Add validation in `middleware/validators.js`
5. Update documentation in `docs/`

### Database Changes
1. Update the model file
2. Create a migration script in `scripts/`
3. Run the migration: `npm run update-category-schema`

### Testing
```bash
# Test the API endpoints
curl http://localhost:5000/api/categories

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/categories
```

## Troubleshooting

### Common Issues

1. **Router Error: "You cannot render a <Router> inside another <Router>"**
   - **Solution**: AdminIndex.jsx no longer has its own Router wrapper
   - The admin panel is now properly integrated with the main App.jsx Router

2. **Too Many Roles in Database**
   - **Solution**: Run `npm run cleanup-roles` to reset to exactly 3 roles
   - Then run `npm run seed-admins` to recreate admin users

3. **Database Connection Error**
   - Check PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

4. **JWT Token Issues**
   - Check `JWT_SECRET` in `.env`
   - Verify token expiration
   - Check Authorization header format

5. **File Upload Errors**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure upload directory permissions

### Logs
- Check console output for errors
- Database logs in PostgreSQL
- Application logs in production

## Contributing

1. Follow the existing code structure
2. Add proper validation and error handling
3. Update documentation for new features
4. Test thoroughly before submitting

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Check the documentation in `docs/`
- Review the API endpoints
- Check the troubleshooting section
- Contact the development team
