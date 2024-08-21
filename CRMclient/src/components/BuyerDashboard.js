import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
const BuyerDashboard = ({ username }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`/api/buyer/${username}/records`);
        setRecords(response.data);
      
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [username]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container maxWidth="md">
    <Box sx={{ marginTop: 16, padding: 3, borderRadius: 3, boxShadow: 5 }}>
      <Typography variant="h5" gutterBottom>
        {username}
      </Typography>
      <TableContainer component={Paper} sx={{  borderRadius: 0, boxShadow:0 }}>
        <Table sx={{borderRadius:0, minWidth:650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Date</TableCell>
              <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Revenue</TableCell>
              <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Expenses</TableCell>
              <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{record.date}</TableCell>
                <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{`$${record.income}`}</TableCell>
                <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{`$${record.expenses}`}</TableCell>
                <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{`$${record.profit}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Container>
);
};

export default BuyerDashboard;