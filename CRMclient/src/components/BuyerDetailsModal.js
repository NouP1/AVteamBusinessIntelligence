import React from 'react';
import { Button,Modal, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';

const BuyerDetailsModal = ({ open, handleClose, buyerDetails }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: '65%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          border: '0',
         //borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'auto',
          outline: 'none',
          overflowX: 'hidden'
        }}
      >
        <Typography variant="h6" component="h2" id="modal-title">
          Данные байера: {buyerDetails.nameBuyer}
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius:2, boxShadow:2, border:'1px solid rgba(224, 224, 224, 1)',}}>
        <Table  >
        <TableHead>
              <TableRow>
                <TableCell sx={{borderRight:'1px solid rgba(224, 224, 224, 1)', }}>Date</TableCell>
                <TableCell sx={{borderRight:'1px solid rgba(224, 224, 224, 1)'}}>Revenue</TableCell>
                <TableCell sx={{borderRight:'1px solid rgba(224, 224, 224, 1)'}}>Spent</TableCell>
                <TableCell sx={{borderRight:'1px solid rgba(224, 224, 224, 1)'}}>Profit</TableCell>
                <TableCell sx={{borderRight:'1px solid rgba(224, 224, 224, 1)'}}>ROI</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buyerDetails.records.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + record.income}</TableCell>
                  <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{'$' + record.expenses}</TableCell>
                  <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{record.profit}</TableCell>
                  <TableCell sx={{border:'1px solid rgba(224, 224, 224, 1)'}}>{record.Roi}</TableCell>
                </TableRow>
              ))}
            </TableBody>
       
        </Table> 
        
        </TableContainer>
        <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2 }}>
          Закрыть
        </Button>
      </Box>
      
    </Modal>
  );
};

export default BuyerDetailsModal;