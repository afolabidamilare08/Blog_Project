const express = require('express');
const router = express.Router();
const adminBlogController = require('../controllers/adminBlogController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { 
  validateBlogCreate, 
  validateBlogUpdate, 
  validateBlogId, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (including drafts) - Admin only
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of blogs per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter by blog status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for title, body, and tags
 *     responses:
 *       200:
 *         description: List of all blogs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/blogs', validatePagination, validateSearch, adminBlogController.getAllBlogsAdmin);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   get:
 *     summary: Get blog by ID (including drafts) - Admin only
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/blogs/:id', validateBlogId, adminBlogController.getBlogByIdAdmin);

/**
 * @swagger
 * /api/admin/blogs:
 *   post:
 *     summary: Create new blog - Admin only
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Blog title
 *               body:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array of paragraphs (send as multiple body[] fields)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Blog tags (send as multiple tags[] fields)
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: Blog status
 *               excerpt:
 *                 type: string
 *                 maxLength: 300
 *                 description: Blog excerpt
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (max 10, 5MB each)
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blog created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error or duplicate title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/blogs', uploadMultiple, validateBlogCreate, adminBlogController.createBlog);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   put:
 *     summary: Update blog - Admin only
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Blog title
 *               body:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array of paragraphs (send as multiple body[] fields)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Blog tags (send as multiple tags[] fields)
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Blog status
 *               excerpt:
 *                 type: string
 *                 maxLength: 300
 *                 description: Blog excerpt
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Additional image files
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only edit own blogs unless super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/blogs/:id', uploadMultiple, validateBlogUpdate, adminBlogController.updateBlog);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   delete:
 *     summary: Delete blog - Admin only
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blog deleted successfully
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only delete own blogs unless super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/blogs/:id', validateBlogId, adminBlogController.deleteBlog);

module.exports = router; 