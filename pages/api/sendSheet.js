import { sheetTemplate } from "../../templates/sheettemplate";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");
const nodemailer = require("nodemailer");

export default async function handler(req, res) {
    function getTemplate(name, link) {
       return sheetTemplate({name, url: link});
    }

    const config1 = {
        server: process.env.MAIL_SERVER_PRIMARY,
        port: 465,
        username: process.env.MAIL_USER_PRIMARY,
        password: process.env.MAIL_PASS_PRIMARY,
        from: process.env.MAIL_USER_PRIMARY,
    };

    const config2 = {
        server: process.env.MAIL_SERVER_ZOHO,
        port: 465,
        username: process.env.MAIL_USER_ZOHO,
        password: process.env.MAIL_PASS_ZOHO,
        from: process.env.MAIL_USER_ZOHO,
    };

    const mainbody = req.body.record;
    const mailData = {
        from: {
            name: "IPM Careers",
            address: config1.from,
        },
        to: mainbody.email,
        subject: `Hey ${mainbody.name} 😎 ! Your IPMAT ScoreCard is Here 📄 😃 !! Successfully Generated using IPM Careers Response Sheet Tool.`,
        text: " | Sent from: register@ipmcareer.com",
        html: getTemplate(mainbody.name, `https://register.ipmcareer.com/scorecard/${mainbody.uuid}`),
    };

    async function sendMail(config) {
        const transporter = nodemailer.createTransport({
            port: config.port,
            host: config.server,
            auth: {
                user: config.username,
                pass: config.password,
            },
            secure: true,
        });

        return transporter.sendMail(mailData);
    }

    try {
        await sendMail(config1);
        console.log("Message sent successfully using config1");
        res.status(200).json({ msg: "Message sent successfully" });
    } catch (err1) {
        console.log("Error using config1:", err1);
        try {
            mailData.from.address = config2.from; // Update sender address for the second config
            await sendMail(config2);
            console.log("Message sent successfully using config2");
            res.status(200).json({ msg: "Message sent successfully using fallback config" });
        } catch (err2) {
            console.log("Error using config2:", err2);
            res.status(500).json({ error: "Failed to send email using both configurations", details: err2 });
        }
    }
}
