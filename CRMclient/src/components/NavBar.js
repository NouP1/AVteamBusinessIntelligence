import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/system';

const NavBar = ({ onMenuClick, onLogout}) => {
    const AppBarStyled = styled(AppBar)({
        zIndex: 1400, // make sure the Navbar is above the Sidebar
        transition: 'width 0.3s ease-out, margin 0.3s ease-out',
      });
    
  return (
    <AppBarStyled position="fixed">
  
      <Toolbar>
        <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        sx={{ mr: 2 }}  
        onClick={onMenuClick} >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Панель управления
        </Typography>
        <Button color="inherit" onClick={onLogout} sx={{ ml: 'auto', color: '#fff' }}>
          Выйти
        </Button>
      </Toolbar>
 
    </AppBarStyled>
  );
};

export default NavBar;