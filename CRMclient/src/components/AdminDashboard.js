import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Table, Button, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import BuyerDetailsModal from './BuyerDetailsModal';

const AdminDashboard = () => {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await axios.get('http://185.81.115.100:3100/admin/buyers');
        setBuyers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBuyers();
  }, []);

  const handleRowClick = async (buyer) => {
    try {
      const response = await axios.get(`http://185.81.115.100:3100/buyer/${buyer.nameBuyer}/records`);
      const buyerDetails = {
        nameBuyer: buyer.nameBuyer,
        records: response.data,
      };
      setSelectedBuyer(buyerDetails);
      setModalOpen(true);
    } catch (error) {
      console.error('Ошибка получения данных по байеру:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };



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
              <TableRow  key={buyer.id} 
              onClick={(event) => {
                event.currentTarget.blur(); // Убираем фокус с текущей строки
                handleRowClick(buyer);
              }} 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f5f5f5', // Цвет фона при наведении
                  transition: 'background-color 0.3s ease',
                },
                '&:focus': {
                  outline: 'none', // Убираем обводку при фокусе
                },
              }}
            >
                {/* <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.id}</TableCell> */}
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.nameBuyer}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + buyer.countRevenue}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + buyer.expenses}</TableCell> {/* Если расходы отсутствуют, заменить '---' на реальные данные */}
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{buyer.countFirstdeps}</TableCell>
                <TableCell align="left" sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + buyer.profit}</TableCell> {/* Заменить на реальный расчет профита */}
              </TableRow>
              
            ))}
          </TableBody>
        </Table>
      </TableContainer>
     
    </Box>
    {selectedBuyer && (
        <BuyerDetailsModal open={modalOpen} handleClose={handleCloseModal} buyerDetails={selectedBuyer} />
      )}
  </Container>
);
};


export default AdminDashboard;