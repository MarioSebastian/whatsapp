const mongoose = require("mongoose").default;
const { MongoStore } = require("wwebjs-mongo");
const { Client, RemoteAuth, MessageMedia} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
let client;

//Connect to nosql database and get persisted session data
console.log("Attempting to connect to Atlas Nosql DB");
mongoose
  .connect("mongodb+srv://mariosebastian:SoBxB4fzWJlZ2viA@whatsappsession.214xqdg.mongodb.net/?retryWrites=true&w=majority")
  .then(async () => {
      console.log("Connected to Atlas Nosql DB");

      console.log("Attempting to create new MongoStore");
      const store = new MongoStore({ mongoose: mongoose });
      console.log("Successfully created new MongoStore");

      console.log("Attempting to create new Whatsapp Web Client");
      client = new Client({
          authStrategy: new RemoteAuth({
              store: store,
              backupSyncIntervalMs: 300000,
          }),
          webVersionCache: {
              type: "remote",
              remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
          },
          authTimeoutMs: 60000,
          puppeteer: {
              args: [
                  "--no-sandbox",
                  "--disable-setuid-sandbox",
                  "--disable-dev-shm-usage",
              ],
              headless: true,
          },
      });
      console.log("Error creating new Whatsapp Web Client");
      client.initialize().then(() => {
          console.log("Initialized client");
      });
      client.on("qr", (qr) => {
          qrcode.generate(qr, { small: true });
      });
      client.on("remote_session_saved", () => {
          console.log("Client remote session saved");
      });
      client.on("ready", () => {
          console.log("Client is ready to send/receive requests");
      });
  })
  .catch((err) => {
      console.log("Error initializing bot: "+err);
  });

//Send whatsapp message to numbers
function sendWhatsappMessageNumber(number, message, response) {
  if (!client || !client.info)
      response.status(400).send("Client is not ready!");
  else {
      client.getContactById(number + "@c.us")
          .then((contact)=> {
              if (contact.isMyContact){
                  client
                      .sendMessage(number + "@c.us", message)
                      .then((r) => {
                          response.status(200).send("Message sent to [+" + number + "] successfully: " + r.body);
                      })
                      .catch((err) => {
                          response.status(400).send("Failed to send message: " + err);
                      });
              }
              else {
                  response.status(400).send("Failed to send message: This contact is not added as a contact yet");
              }
          })
          .catch((err) => {
              response.status(400).send("Failed to get contact: " + err);
          });
  }
}

//Send whatsapp message with file to numbers

//Send whatsapp message to groups
function sendWhatsappMessageGroup(groupName, message, response) {
    if (!client || !client.info)
        response.status(400).send("Client is not ready!");
    else {
        client.getChats().then((chats) => {
            chats
                .find((chat) => chat.isGroup && chat.name === groupName)
                .sendMessage(message)
                .then((r) => {
                    response.status(200).send("Message sent to [+" + groupName + "] successfully: " + r.body);
                })
                .catch((err) => {
                    response.status(400).send("Failed to send message: " + err);
                });
        })
            .catch((err) => {
                response.status(400).send("Failed to send message: " + err);
            });
    }
}

//Send whatsapp message with file to groups

module.exports = {
    sendWhatsappMessageNumber,
    sendWhatsappMessageGroup,
};
