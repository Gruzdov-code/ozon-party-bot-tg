import {Telegraf} from "telegraf";
import {showMenu} from "./menu.js";
import fs from "fs";
const data = fs.readFileSync("./users.json", "utf8", (err, data) => {
  if (err) throw err;

});
  global.users = JSON.parse(data);
  global.userIdList= Object.keys(users)
// const HttpsProxyAgent = require('https-proxy-agent');
// Общие настройки
const config = {
  "token": "6476063403:AAGQmIo4bMkHEIkWwa77qNfo3dYQuO_03eQ", // Токен бота
  "admin": 111, // я
  // "admin": 451019148, // я
  "barman": 639611757, // Вова
  "barman4": 559085599, // Проша
  "barman2": 197813146, // Лера
  // "barman3": 418259847 // Колт
};
// Создаем объект бота
const bot = new Telegraf(config.token, {
      // Если надо ходить через прокси - укажите: user, pass, host, port
      // telegram: { agent: new HttpsProxyAgent('http://user:pass@host:port') }
    }
);
// Текстовые настройки
let replyText = {
  "helloAdmin": "Привет админ, ждем сообщения от пользователей",
  "helloUser":  "Приветствую, отправьте мне сообщение. Постараюсь ответить в ближайшее время.",
  "replyWrong": "Для ответа пользователю используйте функцию Ответить/Reply."
};
// Проверяем пользователя на права
let isAdmin = (userId) => {
  return userId == config.admin;
};
let isBarman = (userId) => {
  return userId == (config.barman || config.barman2 || config.barman4);
};


// const
const coctailList = userIdList.flatMap((el)=>{
  const result=[]
  result.push(...users[el].coctailList)
  return [...result]
})
const availableCoctails = []
 coctailList.map((el)=>{
  el.isAvailable ? availableCoctails.push([{text:el.fullName , callback_data:el.shortName}]) : ''
  return availableCoctails
})

 const replyToUser = async (query, searchCoctail, userId) =>{
      bot.telegram.sendMessage(query.update.callback_query.from.id, 'Вжух! Мы уже готовим твой коктейль. +\n' +
        `Номер заказа: ${searchCoctail.shortName+users[userId].orders.length}`)
      bot.telegram.sendMessage(query.update.callback_query.from.id, 'А пока ждешь, добавь себе стикер-пак от OZON Банка для особо важных переговоров😎')
      query.replyWithSticker('CAACAgIAAxkBAAIC0mZTlQ_Saj1mRPa8XDt8sUCaXDiSAALKQgACl_AxSsv-hHMxONVnNQQ')

}


// Перенаправляем админу от пользователя или уведомляем админа об ошибке
// Старт бота
bot.start((ctx) => {
  // if ()
  console.log('ctx', ctx.message.from.id)
  ctx.reply(isAdmin(ctx.message.from.id)
      ? replyText.helloAdmin
      : replyText.helloUser);
});
// Слушаем на наличие объекта message
bot.on('message', (ctx) => {
  console.log('ctx',ctx.message)
if (ctx.message.text=='start'){
  showMenu(bot,ctx.message.chat.id,availableCoctails)
}
})

bot.on('callback_query', query => {


  for(let userId in users) {
    if (!users) return
   const searchCoctail = users[userId].coctailList.find((coctail)=> coctail.shortName===query.update.callback_query.data)
    if (searchCoctail){
      users[userId].orders.push({
        "number": searchCoctail.shortName+users[userId].orders.length,
        "createdAt": new Date(),
        "isDone": false
      })
      fs.writeFileSync("./users.json", JSON.stringify(global.users), (err) => {
        if (err) throw err;
      });
        replyToUser(query,searchCoctail, userId).then(res=>(console.log('res',res))).catch(err=>( console.log('err',err)))
    }
  }
})


// запускаем бот
bot.launch();