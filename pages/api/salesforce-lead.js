import axios from "axios";
import qs from "qs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const formData = req.body;

  try {
    // Step 1: Get OAuth token
    const oauthData = qs.stringify({
      grant_type: "password",
      client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET,
      username: process.env.NEXT_PUBLIC_SALESFORCE_USERNAME,
      password: process.env.NEXT_PUBLIC_SALESFORCE_PASSWORD,
    });

    const oauthResponse = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      oauthData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, instance_url } = oauthResponse.data;
    console.log(`Access token`, access_token);
    console.log(`instance_url`, instance_url);

    // Step 2: Create lead
    const nameParts = formData.fullname.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const leadData = {
      FirstName: firstName,
      LastName: lastName,
      Email: formData.email,
      MobilePhone: formData.phone,
      State: "",
      City: formData.city,
      Program__c: "Management",
      Program_Level__c: "Postgraduate Programs",
      Course__c: "MBA",
      LeadSource: "API",
      utm_source__c: "IPM",
      UTM_Campaign_Name__c: "",
    };

    const leadResponse = await axios.post(
      `${instance_url}/services/apexrest/LeadCreation`,
      leadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("Lead creation response:", leadResponse.data);

    res.status(200).json({ success: true, data: leadResponse.data });
  } catch (error) {
    console.error(
      "Error in Salesforce integration:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to create Salesforce lead",
      details: error.response ? error.response.data : error.message,
    });
  }
}
