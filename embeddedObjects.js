const { MessageEmbed } = require("discord.js");

const playEmbedded = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Now PLaying",
  iconURL: "https://i.imgur.com/aIVXUJG.jpg",
});

const queueEmbedded = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Added To Queue",
  iconURL: "https://i.imgur.com/aIVXUJG.jpg",
});

const pausedEmbedded = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Attempting to Pause",
  iconURL: "https://i.imgur.com/aIVXUJG.jpg",
});

const resumeEmbedded = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Attempting to Resume",
  iconURL: "https://i.imgur.com/aIVXUJG.jpg",
});

const errorEmbedded = new MessageEmbed().setColor("#74ac8d").setAuthor({
  name: "| Error Encountered",
  iconURL: "https://i.imgur.com/aIVXUJG.jpg",
});

module.exports = {
  playEmbedded,
  queueEmbedded,
  pausedEmbedded,
  resumeEmbedded,
  errorEmbedded,
};
