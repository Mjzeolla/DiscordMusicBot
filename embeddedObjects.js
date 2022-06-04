const { MessageEmbed } = require("discord.js");

const mainEmbeddedMessage = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Error Encountered",
  iconURL: "https://i.imgur.com/paGuHBV.jpg",
});

module.exports = {
  mainEmbeddedMessage,
};
