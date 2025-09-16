import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { fullname, email, phone, year, city } = req.body;

  const config = {
    server: "smtp.zeptomail.in",
    port: 465,
    username: "emailapikey",
    password:
      "PHtE6r1fS7y93mYmoRFVt6S9F5GtMd98r74yeFNG4oxKA/BRG00A+YsskGO1okwrVqERHKKTzt884rjNt7rQdD25Yz0eWGqyqK3sx/VYSPOZsbq6x00ct14ZdULaV4fndd5u3Sffvt/cNA==",
    from: "noreply@ipmcareer.com",
  };

  const transporter = nodemailer.createTransport({
    port: config.port,
    host: config.server,
    auth: {
      user: config.username,
      pass: config.password,
    },
    secure: true,
  });

  const mailData = {
    from: {
      name: "IPM Careers Contact Form",
      address: config.from,
    },
    to: "ipmcareeronline@gmail.com",
    subject: "New Contact Submission from Landing Page",
    text: `
New submission received:

Name: ${fullname}
Email: ${email}
Phone: ${phone}
Year: ${year}
City: ${city}
    `,
    html: `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${fullname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Year:</strong> ${year}</p>
      <p><strong>City:</strong> ${city}</p>
    `,
  };

  try {
    await transporter.sendMail(mailData);
    return res.status(200).json({ msg: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
