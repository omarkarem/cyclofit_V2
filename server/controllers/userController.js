const User = require('../models/User');

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 