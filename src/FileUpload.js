import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
        src="https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif" // Replace with your GIF URL
        alt="Upload Placeholder"
        style={gifStyle}
      />
      <p>Drag & drop a resume (PDF or DOCX) here, or click to select a file</p>
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #007bff',
  borderRadius: '5px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px 0',
  backgroundColor: '#f9f9f9',
  minHeight: '200px', // Adjusted height for better spacing
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const gifStyle = {
  width: '100px', // Adjust size as needed
  height: '100px',
  marginBottom: '10px',
};

export default FileUpload;
