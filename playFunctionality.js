const {
  getVoiceConnection,
  createAudioResource,
  VoiceConnectionStatus,
  joinVoiceChannel,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const play = require("play-dl");

const playAudio = async (message, args) => {
  const server = args[message.guildId];
  const voiceChannel = message.member.voice.channel;

  //Get the persmissions of the user attempting to conncet the bot

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT"))
    return message.channel.send("Incorrect permissions");
  if (!permissions.has("SPEAK"))
    return message.channel.send("Incorrect permissions");

  let connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  connection.subscribe(server.player);

  console.log(server.queue[0]);
  console.log("PLating as");
  playSound(voiceChannel, server.queue, server.player);

  server.player.on(AudioPlayerStatus.Idle, () => {
    console.log("IN Idle");
    console.log(args);

    server.queue.shift();
    if (server.queue[0]) playSound(voiceChannel, server.queue, server.player);
    console.log(args);
    if (server.queue.length === 0) {
      server.player.removeAllListeners(AudioPlayerStatus.Idle);
      setTimeout(() => {
        console.log("Done Waiting");
        console.log(server.player.state.status);
        if (
          connection.state.status === VoiceConnectionStatus.Ready &&
          server.player.state.status === AudioPlayerStatus.Idle
        ) {
          console.log("DESTROYED");
          server.player.removeAllListeners(AudioPlayerStatus.Idle);
          return connection.disconnect();
        }
      }, 120000);
    }
  });
};

const playSound = (voiceChannel, args, player) => {
  connection = getVoiceConnection(voiceChannel.guild.id);
  let stream = ytdl(args[0], { filter: "audioonly" });
  let resource = createAudioResource(stream);

  player.play(resource);
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------

const stopAudio = async (message) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    console.error("Must be connected to voice channel to stop!");
    return message.reply("Must be connected to voice channel to stop!");
  }
  let connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection) connection.disconnect();
};

const checkURL = (URL) => {
  const URL_Regex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return URL_Regex.test(URL);
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
  playAudio,
  stopAudio,
  playSound,
};
