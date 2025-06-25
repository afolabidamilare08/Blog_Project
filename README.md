# Blog API

A comprehensive backend blog API built with Node.js, Express, and MongoDB.

## Features

- JWT-based admin authentication
- Full CRUD operations for blog posts
- Multiple image upload support
- Public and admin endpoints
- Search and pagination
- Security features (rate limiting, validation)
- **Interactive API Documentation with Swagger UI**

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Seed database**
   ```bash
   npm run seed
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

5. **View API Documentation**
   ```
   Open http://localhost:3000/api-docs in your browser
   ```

## API Documentation

The API includes comprehensive interactive documentation powered by Swagger UI:

- **Interactive Testing**: Test all endpoints directly from the browser
- **Request/Response Examples**: See exact data formats
- **Authentication**: Built-in JWT token management
- **File Upload**: Test image uploads with the interface
- **Schema Definitions**: Complete data model documentation

### Using JWT Authentication in Swagger UI

1. **Get your JWT token**:
   - Go to the `/api/auth/login` endpoint in Swagger UI
   - Use the default credentials: `admin` / `admin123`
   - Execute the request and copy the `token` from the response

2. **Authorize in Swagger UI**:
   - Click the **"Authorize"** button at the top of the Swagger UI page
   - In the authorization popup, enter your JWT token in the `bearerAuth` field
   - Click **"Authorize"** to save the token
   - Close the popup

3. **Test protected endpoints**:
   - Now you can test all admin endpoints that require authentication
   - The token will be automatically included in the Authorization header

### Accessing Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Info**: `http://localhost:3000/`
- **Health Check**: `http://localhost:3000/api/health`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get profile (protected)

### Public Blog Endpoints
- `GET /api/blogs` - Get all published blogs
- `GET /api/blogs/id/:id` - Get blog by ID
- `GET /api/blogs/slug/:slug` - Get blog by slug

### Admin Blog Endpoints (Protected)
- `GET /api/admin/blogs` - Get all blogs (including drafts)
- `POST /api/admin/blogs` - Create blog with images
- `PUT /api/admin/blogs/:id` - Update blog
- `DELETE /api/admin/blogs/:id` - Delete blog

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## File Upload
- Supports multiple images
- Max file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `PORT` - Server port (default: 3000)
- `UPLOAD_PATH` - File upload directory
- `ADMIN_USERNAME` - Default admin username
- `ADMIN_PASSWORD` - Default admin password

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/blog_api
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Seed the database**
   ```bash
   node utils/seeder.js
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Usage Examples

### Authentication

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "...",
      "username": "admin",
      "email": "admin@blogapi.com",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Blog Management

**Create Blog Post**
```bash
curl -X POST http://localhost:3000/api/admin/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=My New Blog Post" \
  -F "body[]=First paragraph of the blog post" \
  -F "body[]=Second paragraph with more content" \
  -F "tags[]=technology" \
  -F "tags[]=programming" \
  -F "status=published" \
  -F "images=@image1.jpg" \
  -F "images=@image2.png"
```

**Get All Published Blogs**
```bash
curl -X GET "http://localhost:3000/api/blogs?page=1&limit=10&q=technology"
```

**Get Blog by Slug**
```bash
curl -X GET http://localhost:3000/api/blogs/slug/my-new-blog-post
```

**Update Blog**
```bash
curl -X PUT http://localhost:3000/api/admin/blogs/BLOG_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Updated Blog Title" \
  -F "body[]=Updated content" \
  -F "status=published"
```

**Delete Blog**
```bash
curl -X DELETE http://localhost:3000/api/admin/blogs/BLOG_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Request/Response Formats

### Blog Object Structure
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "title": "Blog Title",
  "slug": "blog-title",
  "body": [
    "First paragraph",
    "Second paragraph"
  ],
  "images": [
    {
      "filename": "image-1234567890.jpg",
      "originalName": "original-image.jpg",
      "path": "./uploads/image-1234567890.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg"
    }
  ],
  "excerpt": "Blog excerpt...",
  "tags": ["tag1", "tag2"],
  "author": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "username": "admin"
  },
  "status": "published",
  "publishedAt": "2023-01-15T10:30:00.000Z",
  "viewCount": 42,
  "createdAt": "2023-01-15T10:00:00.000Z",
  "updatedAt": "2023-01-15T10:30:00.000Z",
  "imageUrls": ["/uploads/image-1234567890.jpg"]
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "value": ""
    }
  ]
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Search
- `q`: Search query for title, body, and tags

### Filtering (Admin only)
- `status`: Filter by status (`draft` or `published`)

## File Upload

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Maximum file size**: 5MB per file
- **Maximum files**: 10 per request
- **Field name**: `images` (for multiple files)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet for security headers
- **CORS**: Configurable cross-origin resource sharing
- **File Upload Security**: File type and size validation

## Project Structure

```
blog-api/
├── controllers/
│   ├── authController.js
│   ├── blogController.js
│   └── adminBlogController.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── validation.js
├── models/
│   ├── Admin.js
│   └── Blog.js
├── routes/
│   ├── auth.js
│   ├── blogs.js
│   └── admin.js
├── utils/
│   └── seeder.js
├── uploads/
├── server.js
├── package.json
├── env.example
└── README.md
```

## Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 