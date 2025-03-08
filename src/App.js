import React, { useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { Button, Typography, Box, CircularProgress, Card, CardActionArea, CardContent, TextField } from '@mui/material';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { saveAs } from 'file-saver'; // Import file-saver

const App = () => {
  const [text, setText] = useState(''); // State to store raw text
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
        responseType: 'blob', // Important: Set the response type to 'blob'
      });

      // Trigger file download
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, 'resume_data.csv');

    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setText('');
    setFileName('');
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_text.txt';
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
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
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
          variant="h4"
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
      <Card
        sx={{
          boxShadow: 6,
          borderRadius: 3,
          padding: 2,
          width: '100%',
          maxWidth: '600px',
          minHeight: '300px',
          marginTop: '150px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          backdropFilter: 'blur(20px)',
        }}
      >
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
        <Typography 
          variant="body1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '15px 0',
            fontSize: '2rem', // Match h2 default size
            fontFamily: 'Arial, sans-serif',
            padding: '8px',
            borderRadius: '4px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Uploaded file: {fileName}
        </Typography>
      )}

      {text && (
        <Box sx={{ marginTop: '20px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
          <Typography variant="h6">Extracted Text:</Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={text}
            variant="outlined"
            sx={{ marginTop: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            InputProps={{ readOnly: true }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={downloadText}
            sx={{ marginTop: '20px', marginRight: '10px' }}
          >
            Download Text
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