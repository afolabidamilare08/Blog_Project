const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for admin login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Validation rules for blog creation
const validateBlogCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('body')
    .isArray({ min: 1 })
    .withMessage('Blog body must be an array with at least one paragraph')
    .custom((paragraphs) => {
      if (!paragraphs.every(p => typeof p === 'string' && p.trim().length > 0)) {
        throw new Error('All paragraphs must be non-empty strings');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  handleValidationErrors
];

// Validation rules for blog update
const validateBlogUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('body')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Blog body must be an array with at least one paragraph')
    .custom((paragraphs) => {
      if (!paragraphs.every(p => typeof p === 'string' && p.trim().length > 0)) {
        throw new Error('All paragraphs must be non-empty strings');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  handleValidationErrors
];

// Validation for blog ID parameter
const validateBlogId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID format'),
  handleValidationErrors
];

// Validation for blog slug parameter
const validateBlogSlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

// Validation for pagination query parameters
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation for search query
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateBlogCreate,
  validateBlogUpdate,
  validateBlogId,
  validateBlogSlug,
  validatePagination,
  validateSearch,
  handleValidationErrors
}; 