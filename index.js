const Bot = require('./Bot.js');
const config = require('./config.json');
const bot = new Bot(config.token);
bot.start();
