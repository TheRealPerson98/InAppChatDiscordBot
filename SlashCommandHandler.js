const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const fs = require('fs');
const { Collection } = require('discord.js');


class SlashCommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.rest = new REST({ version: '9' }).setToken(token);
  }

  registerCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      this.commands.set(command.data.name, command);
    }

    this.rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: this.commands.map(({ data }) => data.toJSON()) }
    ).then(() => console.log('Successfully registered application commands.'));
  }

  async handleInteraction(interaction) {
    const command = this.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
  }
}

module.exports = SlashCommandHandler;
