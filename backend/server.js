const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const fs = require('fs');
const nlp = require('compromise');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://localhost:3000' }));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log("File received:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
      text = data.text;
    } else if (
      req.file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      fs.unlinkSync(filePath); // Delete the temporary file
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    console.log("Extracted text:", text);

    // Extract keywords using compromise
    const keywords = nlp(text).nouns().out('array');
    console.log("Keywords:", keywords);

    // Delete the temporary file
    fs.unlinkSync(filePath);

    // Send the keywords back to the frontend
    res.json({ keywords });
  } catch (error) {
    console.error('Error parsing file:', error);

    // Delete the temporary file in case of an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Failed to parse file' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});