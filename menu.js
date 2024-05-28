
export const showMenu = (bot, chatId, availableCoctails, text) => {

  bot.telegram.sendMessage(chatId, text , {
    reply_markup: {
      inline_keyboard:
      availableCoctails

    },
  });
};
//

 const closeMenu = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, "Клавиатура закрыта", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};
 // module.s = { showMenu, closeMenu };
