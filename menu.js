
export const showMenu = (bot, chatId, availableCoctails) => {

  bot.telegram.sendMessage(chatId, "Привет! Как насчет отпускного коктейля?\n" +
      "Выбирай любой", {
    reply_markup: {
      inline_keyboard:
      availableCoctails

    },
  });
};

 const closeMenu = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, "Клавиатура закрыта", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};
 // module.s = { showMenu, closeMenu };
