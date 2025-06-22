
import { admitTemplate } from '../../templates/admittemplate';


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
const sendEmail = async ({ email,name,uid,appno }) => {
  try {
    
    const htmlTemplate = admitTemplate({name,appno,uid})
    // Create the email message

    
    const mailOptions = {
      from: '"IPM Careers Admit Card Tool" <info@ipmcareer.in>',
      to: email,
      subject: `Hey ${name} !! Your Admit Card is Ready. Claim your FREE Special IPMAT Admit Card Print.`,
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
 const { name,email,appno,uid } = data;
  
    if (!email||!name||!uid||!appno) {
        
      return res.status(400).json({ success: false, message: 'Mising required fields' });
    }

   
    const result = await sendEmail({  email,name,uid,appno });

   
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
