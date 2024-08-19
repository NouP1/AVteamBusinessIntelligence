const UserModel = require('./usermodel');

const initUsers = async () => {
  try {
    // Сброс таблицы (удаление всех записей)
    await UserModel.sync({ force: true });

    // Создание пользователей
    await UserModel.bulkCreate([
      { username: 'admin', password: 'adminpass', role: 'admin' },
      { username: 'buyer1', password: 'buyerpass1', role: 'buyer', name: 'Artur' },
      { username: 'buyer2', password: 'buyerpass2', role: 'buyer', name: 'Anton' },
      { username: 'buyer3', password: 'buyerpass3', role: 'buyer', name: 'Vova' },
      { username: 'buyer4', password: 'buyerpass4', role: 'buyer', name: 'Pasha' },
      { username: 'buyer5', password: 'buyerpass5', role: 'buyer', name: 'Iliya' },
    ]);

    console.log('Пользователи успешно созданы.');
  } catch (error) {
    console.error('Ошибка при создании пользователей:', error);
  }
};

// Запуск скрипта инициализации
module.exports=initUsers;