const express = require('express');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const router = express.Router();

// Add comment (protected)
router.post('/:blogId', auth, async (req, res) => {
  const { content } = req.body;
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const comment = new Comment({
      blog: req.params.blogId,
      author: req.user._id,
      content
    });
    await comment.save();
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a blog
router.get('/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;