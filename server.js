const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Import cors
require('dotenv').config(); // Load environment variables

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS);

const app = express();
app.use(cors()); // Use cors
app.use(express.json());

app.post('/api/send-signature-request', async (req, res) => {
  const { email, link } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'tyler.l@nexaware.co',
    to: email,
    subject: 'Signature Request',
    text: `Please sign the document using the following link: ${link}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent');
  } catch (error) {
    console.error('Error sending email:', {
      errorMessage: error.message,
      errorStack: error.stack,
    }); 
    res.status(500).send('Failed to send email');
  }
});

app.listen(3001, () => {
  console.log(`Server running on http://localhost:3001`);
});
