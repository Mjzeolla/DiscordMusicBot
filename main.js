const { Client, Intents } = require("discord.js");
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
require("dotenv").config();
const { playAudio, stopAudio } = require("./playFunctionality");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
const PREFIX = "!";

let servers = {};

client.on("ready", () => {
  console.log(`Ready! - ${client.user.username}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "play") {
      if (!isValid(message, args)) return;

      const player = createAudioPlayer();
      player.on("error", (error) => {
        console.error("Error:", error.message);
      });

      if (!servers[message.guildId]) servers[message.guildId] = { queue: [] };
      if (!servers[message.guildId].player)
        servers[message.guildId].player = player;

      let server = servers[message.guildId];
      if (server.queue.length === 0) {
        server.queue.push(args);
        playAudio(message, servers);
      } else server.queue.push(args);

      console.log(servers);
    }
    if (command === "disconnect") {
      servers[message.guildId].queue = [];
      stopAudio(message);
    }
    if (command === "pause") player.pause();
    if (command === "skip") {
      console.log("Skipped");
      let server = servers[message.guildId];
      console.log(server.queue);
      if (server.queue.length > 1) {
        server.queue.shift();
        server.player.stop();
        playAudio(message, servers);
      } else {
        message.reply("No other song is in queue!");
        console.log("Nothing playing");
      }
    }
    if (command === "resume") player.unpause();
  }
});

const isValid = (message, args) => {
  if (!args.length) {
    message.reply("Please include a URL to play!");
    return false;
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    console.error("Must be connected to voice to play!");
    message.reply("Must be connected to voice to play");
    return false;
  }
  return true;
};

client.login(process.env.TOKEN);
