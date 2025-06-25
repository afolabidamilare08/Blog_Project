const Blog = require('../models/Blog');
const { deleteFiles } = require('../middleware/upload');

// Get all published blogs (public)
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.q;

    // Build query
    let query = { status: 'published' };
    
    if (search) {
      query.$text = { $search: search };
    }

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .select('-body') // Don't include full body in list
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs'
    });
  }
};

// Get single blog by ID (public)
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'username')
      .where('status', 'published');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog'
    });
  }
};

// Get single blog by slug (public)
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate('author', 'username')
      .where('status', 'published');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog'
    });
  }
};

// Create new blog (admin only)
const createBlog = async (req, res) => {
  try {
    const { title, body, tags, status, excerpt } = req.body;
    
    // Prepare image data
    const images = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    // Create blog
    const blog = new Blog({
      title,
      body: Array.isArray(body) ? body : [body],
      tags: tags || [],
      status: status || 'draft',
      excerpt,
      images,
      author: req.admin._id,
      publishedAt: status === 'published' ? new Date() : null
    });

    await blog.save();

    // Populate author info
    await blog.populate('author', 'username');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    // Clean up uploaded files if blog creation fails
    if (req.files) {
      deleteFiles(req.files);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blog'
    });
  }
};

// Update blog (admin only)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tags, status, excerpt } = req.body;

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if admin is the author or super admin
    if (blog.author.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own blogs'
      });
    }

    // Prepare image data for new uploads
    const newImages = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    // Update blog
    const updateData = {};
    if (title) updateData.title = title;
    if (body) updateData.body = Array.isArray(body) ? body : [body];
    if (tags) updateData.tags = tags;
    if (status) {
      updateData.status = status;
      if (status === 'published' && !blog.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (newImages.length > 0) {
      updateData.images = [...blog.images, ...newImages];
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: {
        blog: updatedBlog
      }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
    // Clean up uploaded files if update fails
    if (req.files) {
      deleteFiles(req.files);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update blog'
    });
  }
};

// Delete blog (admin only)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if admin is the author or super admin
    if (blog.author.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blogs'
      });
    }

    // Delete associated images
    if (blog.images && blog.images.length > 0) {
      deleteFiles(blog.images);
    }

    // Delete blog
    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog'
    });
  }
};

// Get all blogs (admin - includes drafts)
const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.q;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all blogs admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs'
    });
  }
};

// Get single blog by ID (admin - includes drafts)
const getBlogByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'username');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Get blog by ID admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog'
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getBlogByIdAdmin
}; 