function configureBot(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    bot.chat("This is what I heard: " + message)
  })
}

exports.configureBot = configureBot