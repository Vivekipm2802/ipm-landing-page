// pages/api/contactEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { fullname, email, phone, year, city } = req.body;

  if (!fullname || !email || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", 
      to: ["ipmcareeronline@gmail.com"],     // your notification inbox
      subject: `New Lead: ${fullname}`,
      html: `
        <h2>New Registration</h2>
        <p><strong>Name:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Year:</strong> ${year}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Source:</strong> PI Batch Landing Page</p>
      `,
    });

    return res.status(200).json({ msg: "Email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}