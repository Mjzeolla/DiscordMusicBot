const { Client, Intents } = require("discord.js");
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
require("dotenv").config();
const { playAudio, stopAudio } = require("./playFunctionality");
const { queueEmbedded } = require("./embeddedObjects");

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
      } else {
        queueEmbedded.setAuthor({
          name: "| Queued In Position " + server.queue.length,
          iconURL: "https://i.imgur.com/aIVXUJG.jpg",
        });
        message.reply({ embeds: [queueEmbedded] });
        server.queue.push(args);
      }
    }
    if (command === "disconnect") {
      servers[message.guildId].queue = [];
      servers[message.guildId].player.stop();
      stopAudio(message);
    }
    if (command === "pause") {
      let server = servers[message.guildId];
      if (server) {
        //IT WILL STAY IN THE SERVER FOREVER IF IT IS PAUSED, FIX THIS
        if (server.queue.length > 0) {
          server.player.pause();
          console.log("Paused");
          console.log(server.player.state);
          setTimeout(() => {
            console.log("Done Being");
          }, 60000);
        } else message.reply("No Song Playing");
      } else message.reply("No Song Playing");
    }
    if (command === "skip") {
      console.log("Skipped");
      let server = servers[message.guildId];

      if (server) {
        console.log(server.queue);
        if (server.queue.length >= 2) {
          console.log(server.queue);
          server.player.removeAllListeners(AudioPlayerStatus.Idle);
          server.player.stop(true);
          server.queue.shift();
          playAudio(message, servers);
        } else {
          message.reply("No other song is in queue!");
          console.log("Nothing playing");
        }
      } else {
        message.reply("No Song Playing");
        console.log("Encountered an error! with Skipping");
      }
    }
    if (command === "resume") {
      let server = servers[message.guildId];
      if (server) {
        if (server.queue.length > 0) server.player.unpause();
        else message.reply("No Song Playing");
      } else message.reply("No Song Playing");
    }
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
