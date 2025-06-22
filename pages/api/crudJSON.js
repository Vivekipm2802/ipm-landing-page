// pages/api/createJsonFile.js

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {

    const {fileName,jso} = req.body;
    try {
      const jsonData = jso;
      const filePath = path.join(process.cwd(), 'public', `${fileName}.json`);

      // Write JSON data to the file
      fs.writeFileSync(filePath, JSON.stringify(jsonData));

      return res.status(200).json({ success: true, message: 'JSON file created successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
