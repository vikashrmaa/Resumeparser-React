const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const fs = require('fs');
const { Parser } = require('json2csv'); // Import json2csv
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors({ origin: 'http://localhost:3000' }));

async function getGroqSummary(text) {
  const promptString = `Strict Instructions:

  1. User provides extracted text from a resume.
  2. You are an AI resume parser that strictly formats the output as shown below.
  3. No additional details—follow the format exactly.
  4. Carefully adhere to the instructions; your reputation is on the line.

  Output Format:
  {
    "name": "Atharva Sankhe",
    "education": "RAIT College",
    "certification": ["......"],
    "skills": ["Java", "Python", "Blockchain"],
    "email": "atharva@example.com",
    "contact_no": "1234567890",
    "cgpa": 9.67,
    "projects": [
      {
        "name": "DocGenie",
        "description": "Python-based chat application to interact with PDF documents using local LLMs."
      },
      {
        "name": "ChatLogChain",
        "description": "Secure decentralized chat application using blockchain and hashing for encryption."
      }
    ]
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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
      text = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const summary = await getGroqSummary(text);
    fs.unlinkSync(filePath);

    const jsonData = JSON.parse(summary);

    // Convert JSON data to CSV format
    const fields = ['name', 'education', 'email', 'contact_no', 'cgpa', 'skills', 'certification', 'projects'];
    const json2csvParser = new Parser({ fields });
    
    // Convert skills, certification, and projects to string format
    jsonData.skills = jsonData.skills.join(', ');
    jsonData.certification = jsonData.certification.join(', ');
    jsonData.projects = jsonData.projects.map(proj => `${proj.name}: ${proj.description}`).join(' | ');

    const csvData = json2csvParser.parse(jsonData);

    // Save CSV to a temporary file
    const csvFilePath = `uploads/resume_data_${Date.now()}.csv`;
    fs.writeFileSync(csvFilePath, csvData);

    // Send the file as a response
    res.download(csvFilePath, 'resume_data.csv', (err) => {
      if (err) {
        console.error('File Download Error:', err);
        res.status(500).json({ error: 'Failed to download CSV' });
      }
      // Delete the temporary file after download
      fs.unlinkSync(csvFilePath);
    });

  } catch (error) {
    console.error('Error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process file' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
