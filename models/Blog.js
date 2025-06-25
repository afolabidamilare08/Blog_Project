const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  body: {
    type: [String], // Array of paragraphs
    required: [true, 'Blog body is required'],
    validate: {
      validator: function(paragraphs) {
        return paragraphs.length > 0 && paragraphs.every(p => p.trim().length > 0);
      },
      message: 'Blog must have at least one non-empty paragraph'
    }
  },
  images: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  }],
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.slug = slugify(this.title, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  // Generate excerpt from first paragraph if not provided
  if (!this.excerpt && this.body && this.body.length > 0) {
    this.excerpt = this.body[0].substring(0, 300);
    if (this.excerpt.length === 300) {
      this.excerpt += '...';
    }
  }
  
  next();
});

// Index for better search performance
blogSchema.index({ title: 'text', body: 'text', tags: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });

// Virtual for full image URLs
blogSchema.virtual('imageUrls').get(function() {
  return this.images.map(img => `/uploads/${img.filename}`);
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema); 