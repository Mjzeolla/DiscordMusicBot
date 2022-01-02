const { Client, Intents } = require("discord.js");
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
require("dotenv").config();
const { playAudio, stopAudio } = require("./playFunctionality");
const {
  queueEmbedded,
  pausedEmbedded,
  resumeEmbedded,
  errorEmbedded,
} = require("./embeddedObjects");

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
          iconURL: message.author.displayAvatarURL({ format: "png" }),
        });
        message.channel.send({ embeds: [queueEmbedded] });
        server.queue.push(args);
      }
    }
    if (command === "disconnect") {
      if (servers[message.guildId]) {
        servers[message.guildId].queue = [];
        servers[message.guildId].player.stop();
        stopAudio(message, servers);
      } else {
        errorEmbedded.setAuthor({
          name: "| I Am Not Currently Playing Anything",
          iconURL: message.author.displayAvatarURL({ format: "png" }),
        });
        message.channel.send({ embeds: [errorEmbedded] });
      }
    }
    if (command === "pause") {
      let server = servers[message.guildId];
      if (server) {
        //IT WILL STAY IN THE SERVER FOREVER IF IT IS PAUSED, FIX THIS
        if (server.queue.length > 0) {
          server.player.pause();
          pausedEmbedded.setAuthor({
            name: "| Taking A Quick Break",
            iconURL: message.author.displayAvatarURL({ format: "png" }),
          });
          message.channel.send({ embeds: [pausedEmbedded] });
          console.log("Paused");
          console.log(server.player.state);
          setTimeout(() => {
            console.log("Done Being");
          }, 60000);
        } else {
          pausedEmbedded.setAuthor({
            name: "| No Song Playing",
            iconURL: message.author.displayAvatarURL({ format: "png" }),
          });
          message.channel.send({ embeds: [pausedEmbedded] });
        }
      } else {
        pausedEmbedded.setAuthor({
          name: "| No Song Playing",
          iconURL: message.author.displayAvatarURL({ format: "png" }),
        });
        message.channel.send({ embeds: [pausedEmbedded] });
      }
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
          server.player.stop(true);
          server.queue.shift();
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
        if (server.queue.length > 0) {
          resumeEmbedded.setAuthor({
            name: "| Picking Up Where We Left Off",
            iconURL: message.author.displayAvatarURL({ format: "png" }),
          });
          message.channel.send({ embeds: [resumeEmbedded] });
          server.player.unpause();
        } else {
          resumeEmbedded.setAuthor({
            name: "| No Song To Resume",
            iconURL: message.author.displayAvatarURL({ format: "png" }),
          });
          message.channel.send({ embeds: [resumeEmbedded] });
        }
      } else {
        resumeEmbedded.setAuthor({
          name: "| No Song To Resume",
          iconURL: message.author.displayAvatarURL({ format: "png" }),
        });
        message.channel.send({ embeds: [resumeEmbedded] });
      }
    }
  }
});

const isValid = (message, args) => {
  if (!args.length) {
    errorEmbedded.setAuthor({
      name: "| Please Enter A URL or Search Query",
      iconURL: message.author.displayAvatarURL({ format: "png" }),
    });
    message.channel.send({ embeds: [errorEmbedded] });
    return false;
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    errorEmbedded.setAuthor({
      name: "| Must Be Connected To Voice To Play",
      iconURL: message.author.displayAvatarURL({ format: "png" }),
    });
    message.channel.send({ embeds: [errorEmbedded] });
    console.error("Must be connected to voice to play!");
    return false;
  }
  return true;
};

client.login(process.env.TOKEN);
