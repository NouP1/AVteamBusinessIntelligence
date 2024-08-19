import React from 'react';
import { Button } from '@mui/material';

const LogoutButton = ({ onLogout }) => {
  return (
    <Button 
      variant="contained" 
      color="secondary" 
      sx={{  }}
      onClick={onLogout}
    >
      Выйти
    </Button>
  );
};

export default LogoutButton;