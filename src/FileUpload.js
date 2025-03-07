import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';

const FileUpload = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDropRejected: () => {
      alert('Only PDF and DOCX files are allowed.');
    },
  });

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      <img
        src="assets/upload.gif" // Replace with your GIF URL
        alt="Upload Placeholder"
        style={gifStyle}
      />
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
        Drop resume in PDF or DOCX Format here
      </Typography>
    </div>

  );
};

const dropzoneStyle = {
  // border: '2px dashed #007bff',
  borderRadius: '5px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px 0',
  // backgroundColor: '#f9f9f9',
  minHeight: '200px', // Adjusted height for better spacing
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0)',
  backdropFilter: 'blur(20px)',
  
};

const gifStyle = {
  width: '100px', // Adjust size as needed
  height: '100px',
  marginBottom: '10px',
};

export default FileUpload;
