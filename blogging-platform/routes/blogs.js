const express = require('express');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const router = express.Router();

// Create blog (protected)
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    const blog = new Blog({ title, content, author: req.user._id });
    await blog.save();
    res.status(201).json(blog);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
  res.json(blogs);
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blog (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (!blog.author.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    await blog.save();
    res.json(blog);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (!blog.author.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;