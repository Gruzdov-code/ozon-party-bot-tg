import {Telegraf} from "telegraf";
import {showMenu} from "./menu.js";
import fs from "fs";
const data = fs.readFileSync("./users.json", "utf8", (err, data) => {
  if (err) throw err;

});
  global.users = JSON.parse(data);
  global.userIdList= (Object.keys(users))
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
     bot.telegram.sendMessage(query.update.callback_query.from.id, 'Вжух! Мы уже готовим твой коктейль. \n' +
         `Номер заказа: ${searchCoctail.shortName+users[userId].orders.length}`)
      bot.telegram.sendMessage(query.update.callback_query.from.id, 'А пока ждешь, добавь себе стикер-пак от OZON Банка для особо важных переговоров😎')
       query.replyWithSticker('CAACAgIAAxkBAAIC0mZTlQ_Saj1mRPa8XDt8sUCaXDiSAALKQgACl_AxSsv-hHMxONVnNQQ')
}

const writeOrder = async () => {
     await fs.writeFile("./users.json", JSON.stringify(global.users), (err) => {
         if (err) throw err;
     })
 }
 const sendReadyOrderToUser = async (query,userId) => {
     const textMgs = query.update.callback_query.message.text
     const  str1 = textMgs.indexOf("№")+1
     const str2 = textMgs.indexOf(",")
     const orderNumber=  textMgs.slice(str1,str2)
     console.log('orderNumber',orderNumber)
     console.log('queryyyrr', query)
     // const searchClient = users[userId].orders.find((order)=> order.number===orderNumber ? order.client : '')
     // console.log('searchClient',searchClient)
     // query.reply(orderNumber)
     await  bot.telegram.sendMessage(451019148, `Ваш заказ №${orderNumber} готов `)
 }
 const newOrderFromUser = async (query,userId) => {
     for (let userId in users) {
         const searchCoctail = users[userId].coctailList.find((coctail) => coctail.shortName === query.update.callback_query.data)
         if (searchCoctail) {
             await bot.telegram.sendMessage(userId, `Заказ № ${searchCoctail.shortName + users[userId].orders.length}, коктейль ${searchCoctail.fullName}`, {
                 reply_markup: {
                     inline_keyboard: [
                         [{text: 'Заказ готов', callback_data: 'readyOrder'}]
                     ]
                 },
             })
             users[userId].orders.push({
                 "number": searchCoctail.shortName + users[userId].orders.length,
                 "createdAt": new Date(),
                 "isDone": false,
                 "client": query.update.callback_query.from.id
             })

             await replyToUser(query, searchCoctail, userId)
             fs.writeFile("./users.json", JSON.stringify(global.users), (err) => {
               if (err) throw err;
             });
         }
     }
 }




// Старт бота
bot.start((ctx) => {
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

// Слушаем на колбэки от кнопок
bot.on('callback_query', async query => {

    if (!users) return
      if (users[query.update.callback_query.from.id]){
              switch (query.update.callback_query.data){
                  case 'readyOrder':
                       await sendReadyOrderToUser(query,query.update.callback_query.from.id)
                      break;
              }
              // sendOrderToBarman(query, userId)

              // break;

      }
      else {
              await newOrderFromUser(query)

      }

  // }



})


// запускаем бот
bot.launch();