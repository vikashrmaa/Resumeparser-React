const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const fs = require('fs');
const { Parser } = require('json2csv');
const Groq = require('groq-sdk');
const AdmZip = require('adm-zip');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://localhost:3000' }));

// Updated getGroqSummary to accept an API key as a parameter
async function getGroqSummary(text, apiKey) {
  const groq = new Groq({ apiKey });
  const promptString = `Strict Instructions:

  1. User provides extracted text from a resume.
  2. You are an AI resume parser that strictly formats the output as shown below.
  3. No additional details—follow the format exactly.
  4. Carefully adhere to the instructions; your reputation is on the line.
  5. For Projects shorten description and include up to 4 projects named project1, project2, etc.

  Output Format:
  {
    "name": "Atharva Sankhe",
    "education": "RAIT College",
    "certification": ["......"],
    "skills": ["Java", "Python", "Blockchain"],
    "email": "atharva@example.com",
    "contact_no": "1234567890",
    "cgpa": 9.67,
    "project1": {
      "name": "DocGenie",
      "description": "Python-based chat application to interact with PDF documents using local LLMs."
    },
    "project2": {
      "name": "ChatLogChain",
      "description": "Secure decentralized chat application using blockchain and hashing for encryption."
    }
  }

  Extracted Text:

  ${text}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: promptString }],
    model: "llama-3.1-8b-instant"
  });

  return chatCompletion.choices[0]?.message?.content || "";
}

app.post('/upload', upload.single('file'), async (req, res) => {
  let dataArray = [];
  let filePath = req.file?.path;
  const mimetype = req.file?.mimetype;
  
  // Read the API key from the form data
  const apiKey = req.body.apiKey;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Handle ZIP File Processing
    if (mimetype === 'application/zip') {
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();
      const extractDir = path.join(__dirname, 'uploads', `extracted_${Date.now()}`);

      // Extract ZIP contents
      fs.mkdirSync(extractDir, { recursive: true });
      zip.extractAllTo(extractDir, true);

      // Process each file in the ZIP
      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;

        const entryPath = path.join(extractDir, entry.entryName);
        const ext = path.extname(entry.entryName).toLowerCase();

        // Skip non-resume files
        if (!['.pdf', '.docx'].includes(ext)) continue;

        try {
          // Extract text
          let text = '';
          if (ext === '.pdf') {
            text = (await pdfParse(fs.readFileSync(entryPath))).text;
          } else {
            text = (await mammoth.extractRawText({ path: entryPath })).value;
          }

          // Get parsed data with the provided API key
          const summary = await getGroqSummary(text, apiKey);
          const jsonData = JSON.parse(summary);

          // Process projects
          for (let i = 1; i <= 4; i++) {
            const projectKey = `project${i}`;
            if (jsonData[projectKey]) {
              jsonData[`project${i}_name`] = jsonData[projectKey].name || '';
              jsonData[`project${i}_description`] = jsonData[projectKey].description || '';
              delete jsonData[projectKey];
            } else {
              jsonData[`project${i}_name`] = '';
              jsonData[`project${i}_description`] = '';
            }
          }

          dataArray.push(jsonData);
        } catch (error) {
          console.error(`Error processing ${entry.entryName}:`, error);
        }
      }

      // Cleanup extracted files
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(filePath); // Delete original ZIP
    }
    // Handle Single File Processing
    else {
      let text = '';

      if (mimetype === 'application/pdf') {
        const data = await pdfParse(fs.readFileSync(filePath));
        text = data.text;
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      // Get parsed data with the provided API key
      const summary = await getGroqSummary(text, apiKey);
      const jsonData = JSON.parse(summary);

      // Process projects
      for (let i = 1; i <= 4; i++) {
        const projectKey = `project${i}`;
        if (jsonData[projectKey]) {
          jsonData[`project${i}_name`] = jsonData[projectKey].name || '';
          jsonData[`project${i}_description`] = jsonData[projectKey].description || '';
          delete jsonData[projectKey];
        } else {
          jsonData[`project${i}_name`] = '';
          jsonData[`project${i}_description`] = '';
        }
      }

      dataArray.push(jsonData);
      fs.unlinkSync(filePath);
    }

    // Convert all data to CSV
    const fields = [
      'name', 'education', 'email', 'contact_no', 'cgpa',
      'skills', 'certification',
      'project1_name', 'project1_description',
      'project2_name', 'project2_description',
      'project3_name', 'project3_description',
      'project4_name', 'project4_description'
    ];

    dataArray.forEach(data => {
      data.skills = Array.isArray(data.skills) ? data.skills.join(', ') : '';
      data.certification = Array.isArray(data.certification) ? data.certification.join(', ') : '';
    });

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(dataArray);

    // Send CSV response
    const csvFilePath = path.join(__dirname, `resume_data_${Date.now()}.csv`);
    fs.writeFileSync(csvFilePath, csvData);
    res.download(csvFilePath, 'resume_data.csv', (err) => {
      if (err) {
        console.error('File Download Error:', err);
        res.status(500).json({ error: 'Failed to download CSV' });
      }
      fs.unlinkSync(csvFilePath);
    });

  } catch (error) {
    console.error('Error:', error);
    if (filePath) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to process files' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
