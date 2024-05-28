import { Telegraf } from "telegraf";
import { showMenu } from "./menu.js";
import fs from "fs";
import { quote } from "telegraf/format";
const data = fs.readFileSync("./users.json", "utf8", (err, data) => {
  if (err) throw err;
});
global.users = JSON.parse(data);
global.userIdList = Object.keys(users);
// const HttpsProxyAgent = require('https-proxy-agent');
// Общие настройки
const config = {
  token: "7357115883:AAE4DozS0fVat5QCqSF4QgyMcOX7oKSyi4w", // Токен бота
  // "token": "6476063403:AAGQmIo4bMkHEIkWwa77qNfo3dYQuO_03eQ", // Токен бота
  admin: 111, // я
  // "admin": 451019148, // я
  barman: 639611757, // Вова
  barman4: 559085599, // Проша
  barman2: 197813146, // Лера
  // "barman3": 418259847 // Колт
  // "barman5": 864643473 // ЕРЕГА
};
// Создаем объект бота
const bot = new Telegraf(config.token, {
  // Если надо ходить через прокси - укажите: user, pass, host, port
  // telegram: { agent: new HttpsProxyAgent('http://user:pass@host:port') }
});
// Текстовые настройки
let replyText = {
  helloAdmin: "Привет админ, ждем сообщения от пользователей",
  helloUser:
    "Приветствую, отправьте мне сообщение. Постараюсь ответить в ближайшее время.",
  replyWrong: "Для ответа пользователю используйте функцию Ответить/Reply.",
};
// Проверяем пользователя на права

// const
setInterval(() => {
  fs.writeFile("./users.json", JSON.stringify(global.users), (err) => {
    if (err) throw err;
  });
}, 10000);
const textMenu = "Привет! Как насчет отпускного коктейля?\n" + "Выбирай любой";
const textUpdateMenu = "Держи обновленное меню!";
const coctailList = userIdList.flatMap((el) => {
  const result = [];
  result.push(...users[el].coctailList);
  return [...result];
});
const availableCoctails = [];
coctailList.map((el) => {
  el.isAvailable
    ? availableCoctails.push([
        { text: el.fullName, callback_data: el.shortName },
      ])
    : "";
  return availableCoctails;
});
const deliteAvailableCoctails = [];
coctailList.map((el) => {
  deliteAvailableCoctails.push([
    {
      text: el.isAvailable ? el.fullName + " ✅" : el.fullName + " ❌",
      callback_data: el.shortName,
    },
  ]);
  return deliteAvailableCoctails;
});

const replyToUser = async (query, coctailNumber) => {
  bot.telegram.sendMessage(
    query.update.callback_query.from.id,
    "Вжух! Мы уже готовим твой коктейль. \n" + `Номер заказа: ${coctailNumber}`
  );

  bot.telegram.sendMessage(
    query.update.callback_query.from.id,
    "А пока ждешь, добавь себе стикер-пак от OZON Банка для особо важных переговоров😎"
  );

  query.replyWithSticker(
    "CAACAgIAAxkBAAIC0mZTlQ_Saj1mRPa8XDt8sUCaXDiSAALKQgACl_AxSsv-hHMxONVnNQQ"
  );
};

const sendReadyOrderToUser = async (query, userId) => {
  const textMgs = query.update.callback_query.message.text;
  const str1 = textMgs.indexOf("№") + 2;
  const str2 = textMgs.indexOf(",");
  const orderNumber = textMgs.slice(str1, str2);
  const searchOrder = users[userId].orders.find((order) =>
    order.number == orderNumber ? order.client : ""
  );
  const searchClient = searchOrder.client;
  searchOrder.isDone = true;
  await bot.telegram.sendMessage(
    searchClient,
    `Ваш заказ № ${orderNumber} готов! Подойдите к стойке ${users[userId].username}.`
  );
  await bot.telegram.editMessageReplyMarkup(
    query.update.callback_query.message.chat.id,
    query.update.callback_query.message.message_id,
    { reply_markup: { inline_keyboard: [[{ text: "", callback_data: "" }]] } }
  );
  let newText = query.update.callback_query.message.text + " ✅";
  await bot.telegram.editMessageText(
    query.update.callback_query.message.chat.id,
    query.update.callback_query.message.message_id,
    0,
    newText
  );

  showMenu(bot, searchClient, availableCoctails, textMenu);
};

let isDelite = false;
const coctailIsOver = async (query) => {
    console.log('queryyyyy',query);
  if (!isDelite) return;
  const userId = query.update.callback_query.from.id;
  const searchCoctail = users[userId].coctailList.findIndex(
    (coctail) => coctail.shortName === query.update.callback_query.data
  );
  if (users[userId].coctailList[searchCoctail].isAvailable === false) {
      users[userId].coctailList[searchCoctail].isAvailable = true;
      deliteMenu(query)
    await query.reply(
      `Вы добавили коктейль ${users[userId].coctailList[searchCoctail].fullName} в список`
    );
  } else {
      users[userId].coctailList[searchCoctail].isAvailable = false;
      deliteMenu(query)
    await query.reply(
      `Вы убрали коктейль ${users[userId].coctailList[searchCoctail].fullName} из списка`
    );
    isDelite = false; //вниз?
  }
};

const newOrderFromUser = async (query) => {
    console.log("query22222", query);
  for (let userId in users) {
    const client = query.update.callback_query.from.id;
      const isBusy = users[userId].orders
        .filter((order) => order.client === client)
        .some((order) => {
          console.log("isdone", order.isDone);
        return order?.isDone === false;

        });
      if (isBusy) {
          return
      }
    const searchCoctail = users[userId].coctailList.find(
      (coctail) => coctail.shortName === query.update.callback_query.data
    );
    if (searchCoctail) {
      const coctailNumber =
        searchCoctail.shortName + users[userId].orders.length;
        console.log("coctailNumber", coctailNumber);
        if (!searchCoctail.isAvailable) {
                 bot.telegram.sendMessage(
                   query.update.callback_query.from.id,
                   "Извините, коктейль закончился, ваше меню было обновлено"
            );
                deliteMenu(query);
              await showMenu(bot, client, availableCoctails, textUpdateMenu);

            return
        }
      await bot.telegram.sendMessage(
        userId,
        `Заказ № ${coctailNumber}, коктейль ${searchCoctail.fullName}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Заказ готов", callback_data: "readyOrder" }],
            ],
          },
        }
      );

      users[userId].orders.push({
        number: coctailNumber,
        createdAt: new Date(),
        isDone: false,
        client: client,
      });

      await replyToUser(query, coctailNumber);
    }
  }
};

const deliteMenu = async (query) => {
  await bot.telegram.editMessageReplyMarkup(
    query.update.callback_query.message.chat.id,
    query.update.callback_query.message.message_id,
    {
      reply_markup: { inline_keyboard: [[{ text: "", callback_data: "" }]] },
    }
  );
};

// Слушаем на наличие объекта message
bot.on("message", (ctx) => {
  console.log("ctx", ctx.message);
  if (ctx.message.text == "/start") {
    const client = ctx.message.from.id;
    // const newArrayForJSON = users[userId].orders
    //   .filter((order) => order.client !== client)
    // users[userId].orders = newArrayForJSON;

    showMenu(bot, ctx.message.chat.id, availableCoctails, textMenu);
  }
  if (users[ctx.from.id]) {
    if (ctx.message.text == "/isover") {
      showMenu(
        bot,
        ctx.message.chat.id,
        deliteAvailableCoctails,
        "Выберите коктейль чтобы убрать или вернуть его\n" +
          `✅ — доступные  \n❌ — недоступные \n`
      );
      isDelite = true;
    }
  }
});

// Слушаем на колбэки от кнопок
bot.on("callback_query", async (query) => {
  if (!users) return;
  if (users[query.update.callback_query.from.id]) {
    switch (query.update.callback_query.data) {
      case "readyOrder":
        await sendReadyOrderToUser(query, query.update.callback_query.from.id);
        break;
    }
    if (isDelite) {
      await coctailIsOver(query);
    }
  } else {
    deliteMenu(query);
    await newOrderFromUser(query);
  }

  // }
});

// запускаем бот
bot.launch();
