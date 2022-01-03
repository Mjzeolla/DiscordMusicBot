require("dotenv").config();
const {
  getVoiceConnection,
  createAudioResource,
  VoiceConnectionDestroyedState,
  VoiceConnectionDisconnectedState,
  VoiceConnectionStatus,
  joinVoiceChannel,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const play = require("play-dl");
const search = require("yt-search");
const { playEmbedded, errorEmbedded } = require("./embeddedObjects");

let COOKIE = process.env.COOKIE;

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
  console.log("Plating as");

  playSound(voiceChannel, server.queue, server.player, message);

  server.player.on(AudioPlayerStatus.Idle, () => {
    console.log("In Idle");
    console.log(args);

    server.queue.shift();
    if (server.queue[0])
      playSound(voiceChannel, server.queue, server.player, message);
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

const playSound = async (voiceChannel, args, player, message) => {
  connection = getVoiceConnection(voiceChannel.guild.id);
  let resource = null;
  let info = null;
  if (ytdl.validateURL(args[0])) {
    let stream = await ytdl(
      args[0],
      {
        requestOptions: {
          headers: {
            cookie: COOKIE,
          },
        },
      },

      { highWaterMark: 1 << 25 },
      { type: "opus" }
      //{ filter: "audioonly" }
    );

    resource = createAudioResource(stream);
    info = await ytdl.getInfo(args[0], {
      requestOptions: {
        headers: {
          cookie: COOKIE,
        },
      },
    });
  } else {
    const video = await videoFinder(args.join(" "));
    if (video) {
      info = await ytdl.getInfo(video.url, {
        requestOptions: {
          headers: {
            cookie: COOKIE,
          },
        },
      });

      let stream = await ytdl(
        video.url,
        {
          requestOptions: {
            headers: {
              cookie: COOKIE,
              // Optional. If not given, ytdl-core will try to find it.
              // You can find this by going to a video's watch page, viewing the source,
              // and searching for "ID_TOKEN".
              // 'x-youtube-identity-token': 1324,
            },
          },
        },

        { highWaterMark: 1 << 25 },
        { type: "opus" }
        //{ filter: "audioonly" }
      );

      resource = createAudioResource(stream);
    }
  }

  if (resource) {
    player.play(resource);
    if (info) {
      playEmbedded.fields = [];
      playEmbedded
        .addField(
          "Playing " + info.videoDetails.title,
          "By [" +
            info.videoDetails.author.name +
            "]" +
            `(${info.videoDetails.embed.flashUrl})`
        )
        .setAuthor({
          name: "| Now Playing",
          iconURL: message.author.displayAvatarURL({ format: "png" }),
        });
      //.setThumbnail(info.videoDetails.thumbnails[0].url);
      message.channel.send({ embeds: [playEmbedded] });
    }
  }
};

const videoFinder = async (query) => {
  const videoResult = await search(query);
  return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------

const stopAudio = async (message) => {
  const voiceChannel = message.member.voice.channel;

  let connection = getVoiceConnection(voiceChannel.guild.id);

  if (
    connection.state.status === "disconnected" ||
    connection.state.status === "destroyed"
  ) {
    console.error("Must be connected to voice channel to stop!");
    errorEmbedded.setAuthor({
      name: "| I Am Not Currently Playing Anything",
      iconURL: message.author.displayAvatarURL({ format: "png" }),
    });
    message.channel.send({ embeds: [errorEmbedded] });
    return;
  }
  if (connection) {
    connection.disconnect();
    errorEmbedded.setAuthor({
      name: "| See You Later",
      iconURL: message.author.displayAvatarURL({ format: "png" }),
    });
    message.channel.send({ embeds: [errorEmbedded] });
  }
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
