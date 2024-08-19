import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Table, Button, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


const AdminDashboard = () => {
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await axios.get('http://localhost:3100/admin/buyers');
        setBuyers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBuyers();
  }, []);

  return (
    <Container maxWidth="lg">
    <Box sx={{ marginTop: 16, padding: 3, borderRadius: 3, boxShadow: 5, }}>
      <Typography variant="h5" gutterBottom>
        Панель администратора
      </Typography>
      <TableContainer component={Paper} sx={{boxShadow:0, borderRadius:0}}  >
        <Table sx={{ minWidth:650}} aria-label="buyers table">
          <TableHead >
            <TableRow  >
              {/* <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}} >ID</TableCell> */}
              <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Name</TableCell>
              <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Revenue</TableCell>
              <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Expenses</TableCell>
              <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Firstdeps</TableCell>
              <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {buyers.map((buyer) => (
              <TableRow key={buyer.id}>
                {/* <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.id}</TableCell> */}
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.nameBuyer}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + buyer.countRevenue}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'---'}</TableCell> {/* Если расходы отсутствуют, заменить '---' на реальные данные */}
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.countFirstdeps}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + buyer.countRevenue}</TableCell> {/* Заменить на реальный расчет профита */}
              </TableRow>
              
            ))}
          </TableBody>
        </Table>
      </TableContainer>
     
    </Box>
  </Container>
);
};


export default AdminDashboard;