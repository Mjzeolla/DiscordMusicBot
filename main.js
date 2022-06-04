const { Client, Intents } = require("discord.js");
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
require("dotenv").config();
const { playAudio, stopAudio } = require("./playFunctionality");

const { sendMessage } = require("./clientFunctionality");

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
        sendMessage("Queued In Position " + server.queue.length, message);
        server.queue.push(args);
      }
    }
    if (command === "disconnect") {
      if (servers[message.guildId]) stopAudio(message, servers);
      else sendMessage("I'm Not Currently Playing Anything", message);
    }
    if (command === "pause") {
      let server = servers[message.guildId];
      if (server) {
        //IT WILL STAY IN THE SERVER FOREVER IF IT IS PAUSED, FIX THIS
        if (server.queue.length > 0) {
          server.player.pause();
          sendMessage("Taking A Quick Break", message);
          setTimeout(() => {
            if (server.player.state.status === AudioPlayerStatus.Paused) {
              console.log("DESTROYED");
              server.player.removeAllListeners(AudioPlayerStatus.Idle);
              sendMessage("Leaving due to inactivity", message);
              servers[message.guildId] = { queue: [] };
              return connection.disconnect();
            }
            servers;
            sendMessage("Leaving due to inactivity", message);
            return connection.disconnect();
          }, 300000);
        } else sendMessage("No Song Playing", message);
      } else sendMessage("No Song Playing", message);
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
          server.player.removeAllListeners(AudioPlayerStatus.Idle);
          stopAudio(message, servers);
          sendMessage("I'm All Out Of Songs", message);
        }
      } else sendMessage("No Song Playing", message);
    }
    if (command === "resume") {
      let server = servers[message.guildId];
      if (server) {
        if (server.queue.length > 0) {
          sendMessage("Picking Up Where We Left Off", message);
          server.player.unpause();
        } else sendMessage("No Song To Resume", message);
      } else sendMessage("No Song To Resume", message);
    }
  }
});

const isValid = (message, args) => {
  if (!args.length) {
    sendMessage("Please Enter A URL or Search Query", message);
    return false;
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    sendMessage("Must Be Connected To Voice To Play", message);
    return false;
  }
  return true;
};

client.login(process.env.TOKEN);
