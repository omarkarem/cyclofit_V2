const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// @desc    Submit a new contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create a new contact entry
    const newContact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Optional: Send notification email to admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h3>New contact form submission from CycloFit</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // We don't want to fail the request if just the email fails
      }
    }

    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Your message has been received. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact form submissions
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getContactSubmissions = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update contact submission status
// @route   PATCH /api/contact/:id
// @access  Private (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};