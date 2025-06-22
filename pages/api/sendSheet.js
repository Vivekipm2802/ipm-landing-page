import { sheetTemplate } from "../../templates/sheettemplate";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");
const nodemailer = require("nodemailer");

export default async function handler(req, res) {
    function getTemplate(name, link) {
       return sheetTemplate({name, url: link});
    }

    const config1 = {
        server: "mail.ipmcareer.com",
        port: 465,
        username: "register@ipmcareer.com",
        password: "Androidapp1@",
        from: "register@ipmcareer.com",
    };

    const config2 = {
        server: "smtppro.zoho.in",
        port: 465,
        username: "info@ipmcareer.in",
        password: "IPMCareers$#@1",
        from: "info@ipmcareer.in",
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
