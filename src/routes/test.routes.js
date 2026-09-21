import express from 'express';
import { sendEmail } from '../config/mailer.js';

const router = express.Router();

router.get('/test-email', async (req, res) => {
  await sendEmail({
    to: 'yonasgeb09@gmail.com',
    subject: 'SMTP Test Email',
    html: '<h1>SMTP is working 🚀</h1>',
  });

  res.json({ message: 'Email sent' });
});

export default router;