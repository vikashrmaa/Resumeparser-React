import React, { useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { Button, Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Heading Container */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%', // Moves the heading higher up
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
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
          variant="h5"
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
      </Box>

      {/* Main Content */}
      <Card sx={{ boxShadow: 3, borderRadius: 3, padding: 2, width: '100%', maxWidth: '600px', marginTop: '150px' }}>
        <CardContent>
          {/* File Upload */}
          <FileUpload onFileUpload={handleFileUpload} />
        </CardContent>
      </Card>

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
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Typography variant="h6">Extracted Keywords:</Typography>
          <ul style={{ listStyle: 'none', padding: 0 }}>
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
