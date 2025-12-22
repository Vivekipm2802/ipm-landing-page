import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { name, mobile, email, category, fileUrl, scores } = req.body;

  // Supabase Configuration
  const supabaseUrl = "https://msxeahieemrylklgruhl.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGVhaGllZW1yeWxrbGdydWhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Mzk5OCwiZXhwIjoyMDY2NDI5OTk4fQ.JqmpLWp5-_UKM71vZKLEu4ehztjxUeY9TCHE9SoLmUU";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Insert into Supabase
  try {
    const { error } = await supabase.from("response_sheet_uploads").insert([
      {
        name,
        mobile,
        email,
        category,
        file_url: fileUrl,
        score_sa: scores?.sa || 0,
        score_mcq: scores?.mcq || 0,
        score_va: scores?.va || 0,
        score_total: scores?.total || 0,
        raw_scores: scores,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      // We continue to send email even if DB insert fails, but logging it is important
    }
  } catch (dbError) {
    console.error("Database operation failed:", dbError);
  }

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
      name: "IPM Careers Scorecard Upload",
      address: config.from,
    },
    to: "ipmcareeronline@gmail.com",
    // to: "devankit1994@gmail.com",
    subject: "New Scorecard Uploaded",
    text: `
New scorecard upload received:

Name: ${name}
Mobile: ${mobile}
Email: ${email}
Category: ${category}
File URL: ${fileUrl}

Scores:
Quant SA: ${scores?.sa || 0}
Quant MCQ: ${scores?.mcq || 0}
Verbal Ability: ${scores?.va || 0}
Total: ${scores?.total || 0}
    `,
    html: `
      <h2>New Scorecard Upload</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>File URL:</strong> <a href="${fileUrl}">${fileUrl}</a></p>
      <hr />
      <h3>Scores</h3>
      <ul>
        <li><strong>Quant SA:</strong> ${scores?.sa || 0}</li>
        <li><strong>Quant MCQ:</strong> ${scores?.mcq || 0}</li>
        <li><strong>Verbal Ability:</strong> ${scores?.va || 0}</li>
        <li><strong>Total:</strong> ${scores?.total || 0}</li>
      </ul>
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
