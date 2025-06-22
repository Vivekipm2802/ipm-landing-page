

import { promotemplate } from '../../templates/promotemplate';


// Import the nodemailer library
const nodemailer = require('nodemailer');

// Define your email configuration
const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: 'info@ipmcareer.in',
      pass: 'IPMCareers$#@1',
    },
  });

// Define the function to send the email
const sendEmail = async ({ email,name,uid }) => {
  try {
    
    const htmlTemplate = promotemplate({name,uid})
    // Create the email message

    
    const mailOptions = {
      from: '"IPM Careers Admit Card Tool" <info@ipmcareer.in>',
      to: email,
      subject: `Hey ${name} !! Important Notice ! Your requested feature is now active.`,
      html: htmlTemplate,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, message: 'Error sending email' };
  }
};


export default async (req, res) => {
 
  if (req.method === 'POST') {
    const data = req?.body?.record;
 const { name,email,uid } = data;
  
    if (!email||!name||!uid) {
        
      return res.status(400).json({ success: false, message: 'Mising required fields' });
    }

   
    const result = await sendEmail({  email,name,uid});

   
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
