import React, { useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { Button, Typography, Box, CircularProgress, Skeleton } from '@mui/material';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const App = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (file) => {
    setError('');
    setLoading(true);
    setFileName(file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });
      setKeywords(response.data.keywords);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setKeywords([]);
    setFileName('');
  };

  const downloadKeywords = () => {
    const blob = new Blob([keywords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keywords.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      {/* New Heading */}
      <Typography
  variant="h2"
  align="center"
  gutterBottom
  sx={{
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '5px',
  }}
>
  ParsePro
</Typography>

<Typography
  variant="h3"
  align="center"
  gutterBottom
  sx={{
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
  }}
>
  Resume Parsing Redefined
</Typography>


      <FileUpload onFileUpload={handleFileUpload} />
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <CircularProgressbar value={uploadProgress} text={`${uploadProgress}%`} />
        </Box>
      )}
      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
      {fileName && (
        <Typography variant="body1" align="center">
          Uploaded file: {fileName}
        </Typography>
      )}
      {keywords.length > 0 && (
        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="h6">Extracted Keywords:</Typography>
          <ul>
            {keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="success"
            onClick={downloadKeywords}
            sx={{ marginTop: '20px', marginRight: '10px' }}
          >
            Download Keywords
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClear}
            sx={{ marginTop: '20px' }}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default App;