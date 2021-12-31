const {

  getVoiceConnection,

  createAudioResource,
  VoiceConnectionStatus,
  joinVoiceChannel,


  AudioPlayerStatus
} = require("@discordjs/voice");
const ytdl = require('ytdl-core')

const playAudio = async (message, args) => {
  const { player, mediaQueue } = message
  if (!args.length)
    return message.channel.send("Please include a URL to play!");

  if (!checkURL(args[0])) {
    console.error("Incorrect URL Format")
    return message.reply("Please enter a valid URL")
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    console.error("Must be connected to voice to play!");
    return message.reply("Must be connected to voice to play");
  }

  //Get the persmissions of the user attempting to conncet the bot

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT"))
    return message.channel.send("Incorrect permissions");
  if (!permissions.has("SPEAK"))
    return message.channel.send("Incorrect permissions");
  if (mediaQueue.length === 0) {
    console.log("Playing " + args[0])
    let stream = ytdl(args[0], { filter: 'audioonly' })
    let resource = createAudioResource(stream);


    player.play(resource);
    let connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection = getVoiceConnection(voiceChannel.guild.id);
    connection.subscribe(player);
  } else {
    message.mediaQueue.push(args[0])
  }

  player.on(AudioPlayerStatus.Idle, () => {
    const { mediaQueue } = message;
    setTimeout(() => {
      console.log("Done Waiting");

      // if (connection.state.status === VoiceConnectionStatus.Ready && player.state.status === AudioPlayerStatus.Idle && mediaQueue.length === 0) {
      //   console.log("DESTROYED")
      //   return connection.destroy()
      // }

    }, 120000);

  });

};


//--------------------------------------------------------------------------------------------------------------------------------------------------------


const stopAudio = async (message) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    console.error("Must be connected to voice channel to stop!");
    return message.reply("Must be connected to voice channel to stop!");
  }
  let connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection) connection.destroy()

};

const checkURL = (URL) => {
  const URL_Regex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return URL_Regex.test(URL);
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------



module.exports = {
  playAudio,
  stopAudio
}