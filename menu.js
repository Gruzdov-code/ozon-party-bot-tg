
export const showMenu = (bot, chatId, availableCoctails, text) => {

  bot.telegram.sendMessage(chatId, text , {
    reply_markup: {
      inline_keyboard:
      availableCoctails

    },
  });
};
//

