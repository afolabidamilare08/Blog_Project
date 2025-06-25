const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { validateBlogId, validateBlogSlug, validatePagination, validateSearch } = require('../middleware/validation');

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all published blogs
 *     tags: [Public Blogs]
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
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for title, body, and tags
 *     responses:
 *       200:
 *         description: List of published blogs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validatePagination, validateSearch, blogController.getAllBlogs);

/**
 * @swagger
 * /api/blogs/id/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Public Blogs]
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
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/id/:id', validateBlogId, blogController.getBlogById);

/**
 * @swagger
 * /api/blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Public Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog slug (URL-friendly version of title)
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
 *       400:
 *         description: Invalid slug format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/slug/:slug', validateBlogSlug, blogController.getBlogBySlug);

module.exports = router; 