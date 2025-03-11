// ApiKeyPage.js
import React, { useState } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ApiKeyPage = () => {
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      // Save API key in local storage
      localStorage.setItem('apiKey', apiKey);
      // Redirect to the main app
      navigate('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <Typography variant="h4" gutterBottom>
        Enter API Key
      </Typography>
      <Typography variant="body1" gutterBottom>
        Please enter your API key. This key is required to interact with the resume parsing backend.
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: '300px' }}>
        <TextField
          label="API Key"
          variant="outlined"
          fullWidth
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{ marginBottom: '20px' }}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Save API Key
        </Button>
      </form>
    </Box>
  );
};

export default ApiKeyPage;
