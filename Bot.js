const { Client, GatewayIntentBits } = require('discord.js');
const SlashCommandHandler = require('./SlashCommandHandler');
const MessageHandler = require('./MessageHandler');
const RulesEmbedSender = require('./RulesEmbedSender');
const WelcomeEmbedSender = require('./WelcomeEmbedSender');

class Bot {
  constructor(token) {
    this.token = token;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
      ]
    });

    this.slashCommandHandler = new SlashCommandHandler(this.client);
    this.messageHandler = new MessageHandler('./blocked_words.txt');
    this.rulesEmbedSender = new RulesEmbedSender(this.client);
    this.welcomeEmbedSender = new WelcomeEmbedSender(this.client); // Replace with your welcome channel ID

    this.client.on('ready', () => {
      this.rulesEmbedSender.sendRulesEmbeds();
      this.welcomeEmbedSender.sendWelcomeEmbed();
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('messageCreate', message => this.messageHandler.handle(message));
    this.client.on('interactionCreate', interaction => this.slashCommandHandler.handleInteraction(interaction));
  }

  async start() {
    try {
      await this.slashCommandHandler.registerCommands();
      await this.client.login(this.token);
      console.log('Bot is now online!');
    } catch (error) {
      console.error('Error starting the bot:', error);
    }
  }
}

module.exports = Bot;
