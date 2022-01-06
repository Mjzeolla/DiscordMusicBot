const { mainEmbeddedMessage } = require("./embeddedObjects");

const sendMessage = (newMessage, message) => {
  if (message.author.id === process.env.FATHER_ID) {
    newMessage = newMessage + " Father";
  }

  mainEmbeddedMessage.fields = [];
  mainEmbeddedMessage.setAuthor({
    name: `| ${newMessage}`,
    iconURL: message.author.displayAvatarURL({ format: "png" }),
  });

  return message.channel.send({ embeds: [mainEmbeddedMessage] });
};

module.exports = {
  sendMessage,
};
