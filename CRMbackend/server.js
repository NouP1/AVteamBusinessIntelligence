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

//const cron = require('node-cron');
//const moment = require('moment');

const app = express();
const PORT = 3100;

const apiKey = process.env.GAPI;
const spreadsheetId = process.env.SPREADSHEETID;


app.use(cors({
    origin: 'https://biavteam.olmpgame.com', // Укажите ваш домен
    methods: 'GET,POST',
    credentials: true // если нужны куки
}));
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
    

   


app.post('/login', async (req, res) => {
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

app.get('/admin/buyers', async (req, res) => {
  try {
    const adminUser = await UserModel.findOne({ where: { role: 'admin' } });

    if (adminUser) {
      
      const buyers = await BuyerModel.findAll({
        order: [['nameBuyer', 'ASC']]
      });
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      const buyersWithExpenses = await Promise.all(buyers.map(async buyer => {
        const expenses = await getBuyerExpensesTotal(buyer.nameBuyer);
        const profit = buyer.countRevenue - expenses;
        
        return {
          ...buyer.dataValues,
          expenses: expenses || 0, 
          profit: profit || buyer.countRevenue, 
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



app.post('/webhook/postback', async (req, res) => {
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
  //const expenses = await getBuyerExpenses(req.params.username);

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



app.get('/buyer/:username/records', async (req, res) => {
  try {
    const { username } = req.params;
    
    const buyer = await BuyerModel.findOne({ where: { nameBuyer: username } });
    
    if (buyer) {
      const records = await RevenueRecord.findAll({ where: { buyerId: buyer.id } });

      const recordsWithExpenses = await Promise.all(records.map(async record => {
        const expenses = await getBuyerExpenses(username, record.date); 
        return {
          ...record.toJSON(),
          expenses: expenses,
          profit: record.income - expenses, 
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