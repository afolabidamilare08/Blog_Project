const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'A comprehensive blog API with admin authentication and file uploads',
      contact: {
        name: 'API Support',
        email: 'support@blogapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login endpoint'
        }
      },
      schemas: {
        Admin: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Admin ID'
            },
            username: {
              type: 'string',
              description: 'Admin username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Admin email'
            },
            role: {
              type: 'string',
              enum: ['admin', 'super_admin'],
              description: 'Admin role'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Blog: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Blog ID'
            },
            title: {
              type: 'string',
              description: 'Blog title'
            },
            slug: {
              type: 'string',
              description: 'URL-friendly slug'
            },
            body: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of paragraphs'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string'
                  },
                  originalName: {
                    type: 'string'
                  },
                  path: {
                    type: 'string'
                  },
                  size: {
                    type: 'number'
                  },
                  mimetype: {
                    type: 'string'
                  }
                }
              }
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Full URLs to images'
            },
            excerpt: {
              type: 'string',
              description: 'Blog excerpt'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Blog tags'
            },
            author: {
              $ref: '#/components/schemas/Admin'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              description: 'Blog status'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time'
            },
            viewCount: {
              type: 'number',
              description: 'Number of views'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Admin username'
            },
            password: {
              type: 'string',
              description: 'Admin password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                admin: {
                  $ref: '#/components/schemas/Admin'
                },
                token: {
                  type: 'string',
                  description: 'JWT token - Copy this token and use it in the Authorize button above'
                }
              }
            }
          }
        },
        BlogCreateRequest: {
          type: 'object',
          required: ['title', 'body'],
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Blog title'
            },
            body: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'Array of paragraphs'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Blog tags'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              default: 'draft'
            },
            excerpt: {
              type: 'string',
              maxLength: 300,
              description: 'Blog excerpt'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary'
              },
              description: 'Image files (max 10, 5MB each)'
            }
          }
        },
        BlogUpdateRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Blog title'
            },
            body: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'Array of paragraphs'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Blog tags'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published']
            },
            excerpt: {
              type: 'string',
              maxLength: 300,
              description: 'Blog excerpt'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary'
              },
              description: 'Additional image files'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'object',
              properties: {
                blogs: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Blog'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'number'
                    },
                    limit: {
                      type: 'number'
                    },
                    total: {
                      type: 'number'
                    },
                    pages: {
                      type: 'number'
                    }
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  },
                  value: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 