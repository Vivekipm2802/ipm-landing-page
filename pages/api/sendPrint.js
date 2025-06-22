
import { printTemplate } from '../../templates/printtemplate';
import { supabase } from '../../utils/supabaseClient';


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
const sendEmail = async ({ application_no,pincode,state,city,address }) => {
  try {
     const {data:{email}} = await supabase.from('admit_cards').select('email').eq('appno',application_no).order('created_at',{ascending:false}).limit(1).single()
    const htmlTemplate = printTemplate({application_no,pincode,state,city,address})
    // Create the email message

    console.log(application_no,pincode,state,city,address,email)
    const mailOptions = {
      from: '"IPM Careers Admit Card Tool" <info@ipmcareer.in>',
      to: email,
      subject: `Yay !! We have received your print request !! Hold tight while we process and deliver it to you.`,
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

// Define your Next.js API route
export default async (req, res) => {
 
  if (req.method === 'POST') {
    const data = req?.body?.record;
 const { application_no,pincode,state,city,address } = data;
    // Check if all required fields are present
    if (!application_no||!pincode||!state||!city||!address) {
        
      return res.status(400).json({ success: false, message: 'Mising required fields' });
    }

    // Send the email
    const result = await sendEmail({ application_no,pincode,state,city,address });

    // Respond based on the result of sending the email
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};
