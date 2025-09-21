# Category API Documentation

## Overview
The Category API provides CRUD operations for managing magazine categories with support for different design layouts and status management.

## Base URL
```
http://localhost:5000/api/categories
```

## Authentication
Most endpoints require admin authentication. Include the admin JWT token in the Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

## Endpoints

### 1. Get All Categories
**GET** `/api/categories`

**Description**: Retrieve all categories with their subcategories

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Technology & Innovation",
      "slug": "technology-innovation",
      "description": "Exploring the latest trends...",
      "design": "design1",
      "status": "active",
      "featureImage": "https://...",
      "order": 1,
      "isActive": true,
      "subcategories": []
    }
  ]
}
```

### 2. Get Category by ID
**GET** `/api/categories/:id`

**Description**: Retrieve a specific category by its ID

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "name": "Technology & Innovation",
    "slug": "technology-innovation",
    "description": "Exploring the latest trends...",
    "design": "design1",
    "status": "active",
    "featureImage": "https://...",
    "order": 1,
    "isActive": true,
    "subcategories": [],
    "parent": null
  }
}
```

### 3. Create Category
**POST** `/api/categories`

**Description**: Create a new category (Admin only)

**Request Body**:
```json
{
  "name": "New Category",
  "description": "Category description",
  "design": "design1",
  "status": "active",
  "featureImage": "https://example.com/image.jpg",
  "parentId": "uuid-optional",
  "order": 1
}
```

**Design Options**:
- `design1`: Modern card-based layout
- `design2`: Clean table layout  
- `design3`: Glassmorphism design

**Status Options**:
- `active`: Category is visible and active
- `inactive`: Category is hidden/inactive

**Response**:
```json
{
  "message": "Category created successfully",
  "category": {
    "id": "uuid",
    "name": "New Category",
    "slug": "new-category",
    "design": "design1",
    "status": "active"
  }
}
```

### 4. Update Category
**PUT** `/api/categories/:id`

**Description**: Update an existing category (Admin only)

**Request Body**: Same as create, but all fields are optional

**Response**:
```json
{
  "message": "Category updated successfully",
  "category": {
    "id": "uuid",
    "name": "Updated Category",
    "slug": "updated-category",
    "design": "design2",
    "status": "active"
  }
}
```

### 5. Delete Category
**DELETE** `/api/categories/:id`

**Description**: Delete a category (Admin only)

**Response**:
```json
{
  "message": "Category deleted successfully"
}
```

**Note**: Cannot delete categories with subcategories or articles

### 6. Toggle Category Status
**PATCH** `/api/categories/:id/status`

**Description**: Toggle between active/inactive status (Admin only)

**Response**:
```json
{
  "message": "Category status updated to inactive",
  "category": {
    "id": "uuid",
    "status": "inactive"
  }
}
```

### 7. Update Category Design
**PATCH** `/api/categories/:id/design`

**Description**: Change the design layout of a category (Admin only)

**Request Body**:
```json
{
  "design": "design2"
}
```

**Response**:
```json
{
  "message": "Category design updated successfully",
  "category": {
    "id": "uuid",
    "design": "design2"
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "errors": [
    {
      "msg": "Category name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### Not Found (404)
```json
{
  "message": "Category not found"
}
```

### Server Error (500)
```json
{
  "message": "Server error"
}
```

## Database Schema

```sql
CREATE TABLE "Categories" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(100) NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "design" VARCHAR(10) DEFAULT 'design1' NOT NULL CHECK (design IN ('design1', 'design2', 'design3')),
  "status" VARCHAR(10) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
  "featureImage" TEXT,
  "parentId" UUID REFERENCES "Categories"(id),
  "order" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Frontend Integration

```javascript
// Get all categories
const response = await fetch('/api/categories');
const { categories } = await response.json();

// Create category
const newCategory = await fetch('/api/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    name: 'Technology',
    description: 'Tech news and updates',
    design: 'design1',
    status: 'active'
  })
});

// Update category design
await fetch(`/api/categories/${categoryId}/design`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({ design: 'design2' })
});
```

## Notes

- Category names must be unique within the same parent category
- Slugs are automatically generated from the category name
- Design changes affect the frontend display layout
- Status changes control category visibility
- Categories with subcategories cannot be deleted
- The API supports hierarchical category structures
