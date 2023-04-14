const { EmbedBuilder } = require('discord.js');

class RulesEmbedSender {
  constructor(client) {
    this.client = client;
  }

  async clearRulesChannel(rulesChannel) {
    let messagesExist = true;

    while (messagesExist) {
      const messages = await rulesChannel.messages.fetch({ limit: 100 });
      if (messages.size > 0) {
        await rulesChannel.bulkDelete(messages);
      } else {
        messagesExist = false;
      }
    }
  }

  async sendRulesEmbeds() {
const embed1 = new EmbedBuilder()
  .setColor('#0099ff')
  .setTitle('Server Rules')
  .addFields(
    { name: 'Be respectful', value: 'Refrain from making harsh, impolite, or offensive remarks. Treat others as you would like to be treated.' },
    { name: 'Maintain Appropriate Language', value: 'Keep profanity to a minimum and avoid using any derogatory language towards users. Casual channels may allow some swearing, but official help and code channels should be kept clean.' },
    { name: 'Refrain from Spamming', value: 'Avoid sending multiple short messages in quick succession, as it disrupts the chat and makes scrolling difficult. Aim to keep your messages at least five words long during conversations.' },
    { name: 'No Server Raiding', value: "Server raiding violates Discord's terms of service, and any attempts to bypass these rules may result in a permanent ban." },
    { name: 'Threats are Prohibited', value: 'All forms of threats are strictly forbidden.' },
    { name: 'Adhere to Discord Community Guidelines', value: "Ensure that you follow the overall Discord Community guidelines." },
    { name: 'Seek Permission Before Joining Voice Chats', value: "When joining voice chat channels, make sure you have the permission of existing participants. It's acceptable to join and ask if there's an open spot, but leave if your presence is not welcomed by the initial participants." },
    { name: 'Protect Personal Information', value: "Do not disclose your own or others' personal information without consent, including phone numbers, addresses, or other sensitive details." },
    { name: 'Do Not Share Illegal or Pirated Content', value: "Refrain from sharing links to illicit or pirated content, such as copyrighted materials or stolen software. This violates Discord's terms of service and can result in a server ban." },
    { name: 'Avoid Spreading False or Misleading Information', value: "Ensure the accuracy of information you share and only use reliable sources. Spreading inaccurate or misleading information can harm the community's trust and integrity." }
  )
  .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });

// Second Embed
const embed2 = new EmbedBuilder()
  .setColor('#0099ff')
  .setDescription('Volunteers, Moderators, and Leads have the right to perform actions at their own discretion even if it\'s not listed above. If you have an issue with said action, feel free to DM @Modmail to reach the server admin.')
  .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });

// Third Embed
const embed3 = new EmbedBuilder()
  .setColor('#0099ff')
  .setDescription('The server bot is logging messages.')
  .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });
    const rulesChannel = this.client.channels.cache.get('1096248234466349196'); // replace with the channel ID of your #rules channel

    // Clear the rules channel
    await this.clearRulesChannel(rulesChannel);

    // Send the new embeds
    rulesChannel.send({ embeds: [embed1, embed2, embed3] });
  }
}

module.exports = RulesEmbedSender;
