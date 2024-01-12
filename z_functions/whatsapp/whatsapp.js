const mongoose = require("mongoose").default;
const { MongoStore } = require("wwebjs-mongo");
const locateChrome = require("locate-chrome");
const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
let client;

//Connect to nosql database and get persisted session data
mongoose
  .connect("mongodb+srv://mariosebastian:SoBxB4fzWJlZ2viA@whatsappsession.214xqdg.mongodb.net/?retryWrites=true&w=majority")
  .then(async () => {
    console.log("Connected to Atlas Nosql DB, Attempting to load persisted whatsapp session");
    const executablePath = (await new Promise((resolve) => locateChrome((arg) => resolve(arg)))) || "";
    const store = new MongoStore({ mongoose: mongoose });
    client = new Client({
      puppeteer: {
        executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        headless: true,
      },
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
      authTimeoutMs: 60000,
    });

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
  });
function sendWhatsappNumber(number, message, response) {
  if (!client || !client.info)
    response.status(400).send("Client is not ready!");
  else {
    client
      .sendMessage(number + "@c.us", message)
      .then((r) => {
        response.status(200).send("Message sent to [+" + number + "] successfully: " + r.body);
      })
      .catch((err) => {
        response.status(400).send("Failed to send message: " + err);
      });
  }
}
async function sendWhatsappGroupMessage(groupName, message, response) {
    if (!client || !client.info)
        response.status(400).send("Client is not ready!");
    else {
        const chats = await client.getChats();
        await chats
            .find((chat) => chat.isGroup && chat.name === groupName)
            .sendMessage(message)
            .then((r) => {
                response.status(200).send("Message sent to [+" + groupName + "] successfully: " + r.body);
            })
            .catch((err) => {
                response.status(400).send("Failed to send message: " + err);
            });
    }
}

function sendWhatsappMassNumber(numberList, message, response) {
  console.log("\nAttempting to send mass message");
  if (!client || !client.info)
    response.status(400).send("Client is not ready!");
  else {

    Promise.all(numberList.map((number) => {
        const delayInMilliseconds = (Math.random() * 4 + 2) * 10000;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                client.sendMessage(number + "@c.us", message)
                    .then((result) => resolve(result))
                    .catch((error) => reject(error));
            }, delayInMilliseconds);
        });
    }))
        .then((r) => {
          response.status(200).send("Message sent to [+" + numberList + "] successfully: " + r.body);
        })
        .catch((err) => {
          response.status(400).send("Failed to send messages: " + err);
        });
  }
}



function sendWhatsappMassGroupMessage(groupNameList, message) {
  if (client.info !== undefined) {
    client.getChats().then((chats) => {
      for (const groupName of groupNameList) {
        const groupChat = chats.find(
          (chat) => chat.isGroup && chat.name === groupName
        );
        if (groupChat) {
          groupChat
            .sendMessage(message)
            .then((r) => console.log("sent to " + groupName));
        } else {
          console.log("Chat not found: " + groupName);
        }
      }
    });
    return "Messages sent";
  } else console.log("throw error here");
}

module.exports = {
  sendWhatsappNumber,
  sendWhatsappMassNumber,
  sendWhatsappGroupMessage,
  sendWhatsappMassGroupMessage,
};
