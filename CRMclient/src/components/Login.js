import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login',{username, password});
      if (response.data.success) {
        onLogin(response.data.user);
        setError('');
      } else {
        setError('Неправильный логин или пароль')
      }
    } catch (err) {
      console.error('Ошибка при логине:', error);
      setError('Ошибка сервера. Попробуйте позже.');
    }
  };
  return (
    <Container maxWidth="xs">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginTop: 8, 
          padding: 3, 
          borderRadius: 1, 
          boxShadow: 3 
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>Неправильный логин или пароль</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;