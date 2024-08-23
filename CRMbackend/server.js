const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dayjs = require('dayjs');
const sequelize = require('./db.js');
const BuyerModel = require('./buyersmodel.js');
const RevenueRecord = require('./revmodel.js');
const UserModel = require('./usermodel');
const initUsers = require('./initUsers');
const { google } = require('googleapis');
const axios = require('axios');



require('dotenv').config();



const app = express();
const PORT = 3100;

const apiKey = process.env.GAPI;
const spreadsheetId = process.env.SPREADSHEETID;


app.use(cors());
app.use(bodyParser.json());

initUsers();
 //Расходы по датам
async function getBuyerExpenses(buyerName, date) {
  try { 
      const range = 'A2:E'; 
      const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
          params: {
              key: apiKey,
          },
      });

      const rows = response.data.values; 
      if (rows.length) {
          const buyerColumnIndex = rows[0].indexOf(buyerName);

          if (buyerColumnIndex === -1) {
              throw new Error(`Байер ${buyerName} не найден в таблице.`);
          }

          const matchingRow = rows.find(row => row[0] === date);

          if (matchingRow) {
              const expense = parseFloat(matchingRow[buyerColumnIndex]);
              return !isNaN(expense) ? expense : 0;
          } else {
              throw new Error(`Данные за дату ${date} не найдены.`);
          }
      } else {
          throw new Error('Данные не найдены.');
      }
  } catch (error) {
      console.error('Error getting sheet data:', error);
  }
}
//Суммы расходов байеров
async function getBuyerExpensesTotal(buyerName) {
  try {
    const range = 'A2:E'; 
    const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
      params: {
        key: apiKey,
      },
    });

    const rows = response.data.values;
    if (rows.length) {
      const buyerColumnIndex = rows[0].indexOf(buyerName);

      if (buyerColumnIndex === -1) {
        throw new Error(`Байер ${buyerName} не найден в таблице.`);
      }

      
      const totalExpenses = rows
        .slice(1) // Пропускаем заголовок
        .reduce((sum, row) => {
          const expense = parseFloat(row[buyerColumnIndex]) || 0;
          return sum + expense;
        }, 0);

      return totalExpenses;
    } else {
      throw new Error('Данные не найдены.');
    }
  } catch (error) {
    console.error('Error getting sheet data:', error);
    return 0;
  }
}
    

   


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Пришел запрос на сервере\n${req.body.username}\n${req.body.password}`);

  try {
    const user = await UserModel.findOne({ where: { username, password } });
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Неправильный логин или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/admin/buyers', async (req, res) => {
  try {
    const adminUser = await UserModel.findOne({ where: { role: 'admin' } });

    if (adminUser) {
      
      const buyers = await BuyerModel.findAll({
        order: [['nameBuyer', 'ASC']]
      });
      
      const buyersWithExpenses = await Promise.all(buyers.map(async buyer => {
        const expenses = await getBuyerExpensesTotal(buyer.nameBuyer);
        const profit = buyer.countRevenue - expenses;
        const Roi = (buyer.countRevenue - expenses) / expenses *100
        const formatCurrency = (value) => {
          return value < 0 ? `-$${Math.abs(value)}` : `$${value}`;
        };
        
        return {
          ...buyer.dataValues,
          expenses: expenses || 0, 
          profit: formatCurrency(profit), 
          Roi:Roi.toFixed(2)
        };  
      
      }));
      res.json(buyersWithExpenses);
    } else {
      res.status(403).json({ message: 'Доступ запрещен' });
    }
  } catch (error) {
    console.error('Ошибка получения списка байеров:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});



app.post('/api/webhook/postback', async (req, res) => {
  try {
    const postData = req.body;  
    console.log('Новые данные для CRM:', postData);
    
    const offerParts = postData.campaign_name.split('|');
    const responsiblePerson = offerParts[offerParts.length - 1].trim();
    postData.payout = Math.floor(parseFloat(postData.payout));

    const [buyer, created] = await BuyerModel.findOrCreate({
      where: { nameBuyer: responsiblePerson },
      defaults: { nameBuyer: responsiblePerson, countRevenue: postData.payout, countFirstdeps:1}
  });
  

    if (!created) {
        buyer.countRevenue += postData.payout;
        buyer.countFirstdeps += 1;
        await buyer.save();
    }
    const currentDate = new Date().toISOString().split('T')[0]
    const existingRecord = await RevenueRecord.findOne({
      where: { buyerId: buyer.id, date: currentDate }
    });
    if (existingRecord) {
     
      existingRecord.income += postData.payout;
      existingRecord.profit += postData.payout;
      await existingRecord.save();
    } else {
   
    await RevenueRecord.create({
      buyerId: buyer.id,
      date: currentDate,
      income: postData.payout,
      expenses: 0, 
      profit: postData.payout 
    });
  }
    res.status(200).send('Postback data received');
  } catch (error) {
    console.error('Ошибка обработки postback:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/api/buyer/:username/records', async (req, res) => {
  try {
    const { username } = req.params;
    
    const buyer = await BuyerModel.findOne({ where: { nameBuyer: username } });
    
    if (buyer) {
      const records = await RevenueRecord.findAll({ where: { buyerId: buyer.id } });

      const recordsWithExpenses = await Promise.all(records.map(async record => {
        const expenses = await getBuyerExpenses(username, record.date); 
        const Roi = (record.income - expenses) / expenses*100
        const profit = record.income - expenses;
        const formatCurrency = (value) => {
          return value < 0 ? `-$${Math.abs(value)}` : `$${value}`;
        };


        return {
          ...record.toJSON(),
          expenses: expenses ,
          profit: formatCurrency(profit), 
          Roi: Roi.toFixed(2)
        };
      }));

      res.json(recordsWithExpenses);
    } else {
      res.status(404).json({ message: 'Байер не найден' });
    }
  } catch (error) {
    console.error('Ошибка получения записей байера:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


const startServer = async () => {
  try {
      await sequelize.authenticate();
      await sequelize.sync();
      console.log('Connected to database...');
      
      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
      });
  } catch (error) {
      console.error('Отсутствует подключение к БД', error);
  }
};

startServer();