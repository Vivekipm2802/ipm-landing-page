// Import the nodemailer library
const nodemailer = require('nodemailer');

// Define your email configuration
const transporter = nodemailer.createTransport({
    host: 'mail.ipmcareer.com',
    port: 465,
    secure: true,
    auth: {
      user: 'register@ipmcareer.com',
      pass: 'Androidapp1@',
    },
  });
  
// Define the function to send the email
const sendEmail = async ({ name,parentname,stream,clas,preference,area,phone}) => {
  try {

    const htmlTemplate = `
    <html>
      <body>
        <h2>New Lead Information</h2>
        <p>Hello,</p>
        <p>A new lead has submitted their information. Here are the details:</p>
        <ul>
          <li>Name: ${name}</li>
          <li>Parent: ${parentname}</li>
          <li>Preference: ${preference}</li>
          <li>Stream: ${stream}</li>
          <li>Area: ${area}</li>
          <li>Class: ${clas}</li>
          <li>Phone: ${phone}</li>
          
        </ul>
        <p>Please follow up with the lead as soon as possible.</p>
        <p>Best regards,<br>IPM Careers Pune</p>
      </body>
    </html>
  `;
    // Create the email message
    const mailOptions = {
      from: '"IPM Careers Lead" <register@ipmcareer.com>',
      to: 'ipmcareerspune@gmail.com',
      
      subject: `New Lead from ${name}`,
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
    const { name,parentname,stream,clas,preference,area,phone  } = req.body;

    // Check if all required fields are present
    if(  !name || !parentname || !stream || !clas || !preference || !area || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Send the email
    const result = await sendEmail({ name,parentname,stream,clas,preference,area,phone });

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
