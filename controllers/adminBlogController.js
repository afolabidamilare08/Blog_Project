const Blog = require('../models/Blog');
const { deleteFiles } = require('../middleware/upload');

// Create new blog (admin only)
const createBlog = async (req, res) => {
  try {
    const { title, body, tags, status, excerpt } = req.body;
    
    const images = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

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
    await blog.populate('author', 'username');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
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

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own blogs'
      });
    }

    const newImages = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

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
      data: { blog: updatedBlog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
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

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blogs'
      });
    }

    if (blog.images && blog.images.length > 0) {
      deleteFiles(blog.images);
    }

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

    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
      data: { blog }
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
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getBlogByIdAdmin
}; 