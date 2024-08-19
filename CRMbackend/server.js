const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dayjs = require('dayjs');
const sequelize = require('./db.js');
const BuyerModel = require('./buyersmodel.js');
const RevenueRecord = require('./revmodel.js');
const UserModel = require('./usermodel');
const initUsers = require('./initUsers');

require('dotenv').config();

//const cron = require('node-cron');
//const moment = require('moment');

const app = express();
const PORT = 3100;

app.use(cors());
app.use(bodyParser.json());

initUsers();

// Маршрут для входа
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

      res.json(buyers);
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

    if (!created) {
        buyer.countRevenue += postData.payout;
        buyer.countFirstdeps += 1;
        await buyer.save();
    }

    // Сохраняем данные в таблицу доходов/расходов
    await RevenueRecord.create({
      buyerId: buyer.id,
      date: new Date().toISOString().split('T')[0], // текущая дата
      income: postData.payout,
      expenses: 0, // Здесь указываете реальные расходы, если они есть
      profit: postData.payout // Профит (например, доход минус расходы)
    });

    res.status(200).send('Postback data received');
  } catch (error) {
    console.error('Ошибка обработки postback:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Маршрут для получения информации о конкретном байере
app.get('/buyer/:username/records', async (req, res) => {
  try {
    const buyer = await BuyerModel.findOne({ where: { nameBuyer: req.params.username } });
    
    if (buyer) {
      const records = await RevenueRecord.findAll({ where: { buyerId: buyer.id } });
      res.json(records);
    } else {
      res.status(404).json({ message: 'Байер не найден' });
    }
  } catch (error) {
    console.error('Ошибка получения записей байера:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
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