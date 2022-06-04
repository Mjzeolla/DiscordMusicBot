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
const { sendMessage } = require("./clientFunctionality");
const { mainEmbeddedMessage } = require("./embeddedObjects");
let COOKIE = process.env.COOKIE;

const playAudio = async (message, servers) => {
  const server = servers[message.guildId];
  const voiceChannel = message.member.voice.channel;

  //Get the persmissions of the user attempting to conncet the bot

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT"))
    return sendMessage("Incorrect permissions", message);
  if (!permissions.has("SPEAK"))
    return sendMessage("Incorrect permissions", message);

  let connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  connection.subscribe(server.player);

  console.log(server.queue[0]);
  console.log("Plating as");

  playSound(voiceChannel, server.queue, servers, message);

  server.player.on(AudioPlayerStatus.Idle, () => {
    console.log("In Idle");
    console.log(servers);

    server.queue.shift();
    if (server.queue[0])
      playSound(voiceChannel, server.queue, servers, message);
    console.log(servers);
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
          sendMessage("Leaving due to inactivity", message);
          return connection.disconnect();
        }
      }, 120000);
    }
  });
};

const playSound = async (voiceChannel, args, servers, message) => {
  const server = servers[message.guildId];
  const player = server.player;

  connection = getVoiceConnection(voiceChannel.guild.id);
  let resource = null;
  let info = null;
  if (ytdl.validateURL(args[0])) {
    let stream = await ytdl(
      args[0],
      {
        highWaterMark: 1 << 25,
        type: "opus",
        filter: "audioonly",

        requestOptions: {
          headers: {
            cookie: COOKIE,
          },
        },
      }
      //{ filter: "audioonly" }
    );

    resource = createAudioResource(stream);
    info = await ytdl.getInfo(args[0], {
      highWaterMark: 1 << 25,
      type: "opus",
      filter: "audioonly",

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
        highWaterMark: 1 << 25,
        type: "opus",
        filter: "audioonly",
        requestOptions: {
          headers: {
            cookie: COOKIE,
          },
        },
      });

      let stream = await ytdl(
        video.url,
        {
          highWaterMark: 1 << 25,
          type: "opus",
          filter: "audioonly",

          requestOptions: {
            headers: {
              cookie: COOKIE,
            },
          },
        }

        //{ filter: "audioonly" }
      );

      resource = createAudioResource(stream);
    }
  }

  if (resource) {
    player.play(resource);
    if (info) {
      mainEmbeddedMessage.fields = [];
      mainEmbeddedMessage
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
      let oldMessage = server.botMessage;
      if (oldMessage) {
        oldMessage.delete();
        console.log("Deleting old message");
      } else console.log("Unable to delete old message");
      message.channel.send({ embeds: [mainEmbeddedMessage] }).then((result) => {
        console.log("Pringint new message");

        server.botMessage = result;
      });
    }
  }
};

const videoFinder = async (query) => {
  const videoResult = await search(query);
  return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------

const stopAudio = async (message, servers) => {
  const voiceChannel = message.member.voice.channel;

  let connection = getVoiceConnection(voiceChannel.guild.id);

  if (
    connection.state.status === "disconnected" ||
    connection.state.status === "destroyed"
  )
    return sendMessage("I Am Not Currently Playing Anything", message);

  if (connection) {
    servers[message.guildId].player.stop();

    servers[message.guildId] = { queue: [] };

    if (message.content !== "!skip") {
      connection.disconnect();
      sendMessage("See You Later", message);
    }
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
