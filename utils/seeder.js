const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_api');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Admin.deleteMany({});
    await Blog.deleteMany({});
    console.log('Cleared existing data...');

    // Create default admin user
    const adminData = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      email: 'admin@blogapi.com',
      role: 'super_admin',
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();
    console.log('Created default admin user:', admin.username);

    // Create sample blog posts
    const sampleBlogs = [
      {
        title: 'Welcome to Our Blog API',
        body: [
          'Welcome to our new blog platform! This is the first post to demonstrate the capabilities of our blog API.',
          'Our API supports rich content creation with multiple paragraphs, image uploads, and comprehensive admin management.',
          'Stay tuned for more exciting content and features!'
        ],
        tags: ['welcome', 'introduction', 'api'],
        status: 'published',
        excerpt: 'Welcome to our new blog platform! This is the first post to demonstrate the capabilities of our blog API.',
        author: admin._id,
        publishedAt: new Date(),
        viewCount: 0
      },
      {
        title: 'Getting Started with Blog Management',
        body: [
          'Managing your blog content has never been easier with our comprehensive admin panel.',
          'You can create, edit, and delete blog posts with full control over content, images, and publishing status.',
          'The API provides secure authentication and authorization to ensure only authorized users can manage content.'
        ],
        tags: ['tutorial', 'management', 'admin'],
        status: 'published',
        excerpt: 'Managing your blog content has never been easier with our comprehensive admin panel.',
        author: admin._id,
        publishedAt: new Date(),
        viewCount: 0
      },
      {
        title: 'Draft Post - Coming Soon',
        body: [
          'This is a draft post that demonstrates the draft functionality.',
          'Draft posts are only visible to admin users and can be published when ready.',
          'This feature allows you to work on content without making it public immediately.'
        ],
        tags: ['draft', 'feature'],
        status: 'draft',
        author: admin._id,
        viewCount: 0
      }
    ];

    for (const blogData of sampleBlogs) {
      const blog = new Blog(blogData);
      await blog.save();
    }
    console.log('Created sample blog posts...');

    console.log('Database seeding completed successfully!');
    console.log('\nDefault admin credentials:');
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('\nYou can now start the server and test the API.');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 