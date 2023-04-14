const fs = require('fs');
const { EmbedBuilder  } = require('discord.js');
const levenshtein = require('js-levenshtein');

const MAX_BLOCKED_MESSAGES = 3;
const SPAM_SIMILARITY_THRESHOLD = 0.8;
const SPAM_INTERVAL = 5000; // 5 seconds in milliseconds
const MAX_SPAM_MESSAGES = 3;

class MessageHandler {
  constructor(blockedWordsFile) {
    this.blockedWords = fs.readFileSync(blockedWordsFile, 'utf-8').split('\n');
    this.blockedMessageCount = new Map();
    this.recentMessages = new Map();
    this.spamMessageCount = new Map();
  }

  isBlocked(message) {
    const messageWords = message.content.toLowerCase().split(/\W+/);
    return messageWords.some(word => this.blockedWords.includes(word));
  }

  isSpam(message) {
    const userId = message.author.id;
    const currentTime = Date.now();
    const messageContent = message.content;

    const recentMessage = this.recentMessages.get(userId);

    if (recentMessage && currentTime - recentMessage.timestamp < SPAM_INTERVAL) {
      const similarity =
        1 -
        levenshtein(messageContent, recentMessage.content) /
          Math.max(messageContent.length, recentMessage.content.length);

      if (similarity >= SPAM_SIMILARITY_THRESHOLD) {
        return true;
      }
    }

    this.recentMessages.set(userId, { content: messageContent, timestamp: currentTime });

    return false;
  }

  async handle(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    const isBlocked = this.isBlocked(message);
    const isSpam = this.isSpam(message);

    if (isBlocked || isSpam) {
      await message.delete();

      let userViolations = this.blockedMessageCount.get(userId) || [];

      if (userViolations.length >= MAX_BLOCKED_MESSAGES) {
        console.log(`User ${userId} has reached the maximum number of violations`);
        return;
      }

      userViolations.push({ type: isBlocked ? 'blocked' : 'spam', content: message.content });
      this.blockedMessageCount.set(userId, userViolations);

      const remainingWarnings = MAX_BLOCKED_MESSAGES - userViolations.length;

      if (remainingWarnings === 0) {
        const member = message.member;
        const timeoutDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

        await member.timeout(timeoutDuration, `Timeout for sending ${MAX_BLOCKED_MESSAGES} violations.`);

        // Send DM to the user
        const dmEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Timeout Notification')
          .setDescription(
            `You have been timed out for ${timeoutDuration / 60000} minutes for too many violations.`
          )
          .addFields({
            name: 'Violations',
            value: userViolations.map(violation => `${violation.type}: ${violation.content}`).join('\n'),
            inline: true,
          })
          .setTimestamp()
          .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });

        try {
          await message.author.send({ embeds: [dmEmbed] });
        } catch (error) {
          console.error(`Failed to send DM to user ${userId}:`, error);
        }

        // Send timeout notification to the specific channel
        const channelEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Timeout')
          .setDescription(`User <@${userId}> has been timed out for ${timeoutDuration / 60000} minutes for too many violations.`)
          .addFields({
            name: 'Violations',
            value: userViolations.map(violation => `${violation.type}: ${violation.content}`).join('\n'),
            inline: true,
          })
          .setTimestamp()
          .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });

        const channel = message.client.channels.cache.get('1096213880067342416'); // replace with the channel ID of your #AutoMod channel
        await channel.send({ embeds: [channelEmbed] });

        this.blockedMessageCount.delete(userId);
      } else {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Message Removed')
          .setDescription(
            `Your message has been removed, ${message.author.username}. This is warning ${userViolations.length} out of ${MAX_BLOCKED_MESSAGES}. You have ${remainingWarnings} warning(s) remaining.`
          )
          .setTimestamp()
          .setFooter({ text: 'InAppChat', iconURL: 'https://i.imgur.com/yPTgIKp.png' });

        const embedMessage = await message.channel.send({ embeds: [embed] });

        setTimeout(() => {
          embedMessage.delete();
        }, 5000);
      }
    }
  }
}

module.exports = MessageHandler;
