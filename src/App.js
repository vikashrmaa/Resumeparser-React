import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { Button, Typography, Box, CircularProgress, Card, CardContent, TextField } from '@mui/material';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { saveAs } from 'file-saver';
import darkTheme from './theme';
import {Link } from "@mui/material";




const App = () => {
  // New state to track current page: 'home' or 'about'
  const [page, setPage] = useState('home');

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  
  // State to manage API key input and storage
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  // On mount, check for a stored API key in local storage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Clear error message after 5 seconds if one is set
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear uploaded file message after 5 seconds if one is set
  useEffect(() => {
    if (fileName) {
      const timer = setTimeout(() => setFileName(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [fileName]);

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    localStorage.setItem('apiKey', apiKeyInput);
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('apiKey');
    setApiKey('');
    setApiKeyInput('');
  };

  const handleFileUpload = async (file) => {
    setError('');
    setLoading(true);
    setFileName(file.name);
    const formData = new FormData();
    formData.append('file', file);
    // Use the API key from state
    formData.append('apiKey', apiKey);

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

  // Render About Us page if page state is 'about'
  if (page === "about") {
    return (
      <Box
        sx={{
          // Center the container with a max width
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          minHeight: "100vh",
          
          // Flex layout for vertical stacking
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "left",
        }}
      >
        {/* Heading 1 */}
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontFamily: '"Roboto", sans-serif',
            // Keep the gradient for the heading text only
            background: "linear-gradient(45deg, #90caf9, #f48fb1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "20px",
          }}
        >
          Why We Need an API Key
        </Typography>
  
        {/* Body Text - remove gradient, remove ** */}
        <Typography
          variant="body1"
          sx={{
            fontSize: "1rem",
            marginBottom: "40px",
            textAlign: "left",
            color: "#ffffff", // Adjust if your background is light (e.g. "#333" or "#000")
          }}
        >
          ParsePro uses Groq’s free API to process resumes efficiently. While the 
          LLaMA 3.1 8B model can run locally, hardware limitations make using an 
          API more practical. We do not store your API key; it is cached securely 
          in your browser's local storage. You can reset it anytime if needed.
        </Typography>
  
        {/* Heading 2 */}
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontFamily: '"Roboto", sans-serif',
            background: "linear-gradient(45deg, #90caf9, #f48fb1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "20px",
          }}
        >
          How to Get Your Free Groq API Key
        </Typography>
  
        {/* Instructions as a list */}
        <Typography
          component="ol"
          sx={{
            fontSize: "1rem",
            marginBottom: "20px",
            textAlign: "left",
            paddingLeft: "20px",
            color: "#ffffff", // Adjust if your background is light
          }}
        >
          <li>
            Go to{" "}
            <Link
              href="https://console.groq.com/keys"
              target="_blank"
              sx={{ color: "#90caf9", textDecoration: "none", fontWeight: "bold" }}
            >
              Groq API Key Console
            </Link>.
          </li>
          <li>Log in using Email, Google, or GitHub.</li>
          <li>Click Create API Key.</li>
          <li>Save your key somewhere safe (you won’t be able to see it again).</li>
          <li>Paste the key into ParsePro and start parsing resumes! 🚀</li>
        </Typography>
  
        {/* Extra note */}
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            color: "#cccccc", // Lighter gray for a subtle note
            marginBottom: "40px",
            textAlign: "left",
          }}
        >
          You can create unlimited free API keys, so feel free to generate a new one anytime.
        </Typography>
  
        {/* Back Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setPage("home")}
          sx={{
            borderWidth: 2,
            fontWeight: "bold",
            borderColor: "#2196f3", // Blue border
            color: "#2196f3", // Blue text
            "&:hover": {
              borderColor: "#2196f3", // Darker blue on hover
              color: "#ffffff", // White text on hover
              backgroundColor: "#2196f3", // Blue background on hover
            },
          }}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
      }}
    >
      {/* Reset API Key button at top right */}
      {apiKey && (
        <Button 
          variant="contained" 
          color="error"
          onClick={handleResetApiKey}
          sx={{ position: 'absolute', top: 20, right: 20, borderWidth: 2, fontWeight: 'bold' }}
          
        >
          Reset API Key
        </Button>
      )}

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

      {/* Main Content Card */}
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
          {/* If no API key has been set, prompt the user for it */}
          {!apiKey ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #90caf9, #f48fb1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '15px 0',
                  fontSize: '2rem',
                  fontFamily: 'Arial, sans-serif',
                  padding: '8px',
                  borderRadius: '4px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Enter Groq API Key
              </Typography>
              <TextField
                fullWidth
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter API Key"
                variant="outlined"
                margin="dense"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    WebkitBackgroundClip: 'text',
                    color: '#90caf9',
                    caretColor: '#90caf9',
                  },
                  '& .MuiInputBase-input::selection': {
                    backgroundColor: 'rgba(144, 202, 249, 0.3)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: '10px' }}>
                <Button
                  variant="outlined"
                  onClick={() => setPage('about')}
                  sx={{ 
                    borderWidth: 2, 
                    fontWeight: 'bold', 
                    borderColor: '#d32f2f', // Orangish-red border
                    color: '#d32f2f', // Orangish-red text
                    '&:hover': { 
                      borderColor: '#d32f2f', // Keep the border color the same
                      color: '#ffffff', // White text on hover
                      backgroundColor: '#d32f2f' // Red background on hover
                    } 
                  }} 
                >
                  Why We Need This?
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleSaveApiKey}
                  sx={{ 
                    borderWidth: 2, 
                    fontWeight: 'bold', 
                    borderColor: '#2196f3', // Blue border
                    color: '#2196f3', // Blue text
                    '&:hover': { 
                      borderColor: '#2196f3', // Darker blue on hover
                      color: '#ffffff', // White text on hover
                      backgroundColor: '#2196f3' // Blue background on hover
                    }
                  }} 
                >
                  Save API Key
                </Button>

              </Box>
            </Box>
          ) : (
            // Once the API key is set, display the file upload interface
            <FileUpload onFileUpload={handleFileUpload} />
          )}
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
            fontSize: '2rem',
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
