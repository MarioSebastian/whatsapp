const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const whatsapp = require("./whatsappFunctions/whatsapp");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(8080, () => {
  console.log("Application listening on port 8080!");
});

app.get(['', '/', '/test'], (req, res) => {
  res.send("server online");
});

//Send whatsapp message to numbers
app.post("/sendWhatsappMessageNumber", (req, res) => {
  whatsapp.sendWhatsappMessageNumber(req.body.phoneNumbers, req.body.message, res);
});

//Send whatsapp message with file to numbers
app.post("/sendWhatsappFileNumber", (req, res) => {
  //multipart form
});

//Send whatsapp message to groups
app.post("/sendWhatsappMessageGroup", (req, res) => {
  whatsapp.sendWhatsappMessageGroup(req.body.groupNames, req.body.message, res);
});

//Send whatsapp message with file to groups
app.post("/sendWhatsappFileGroup", (req, res) => {
  //multipart form
});
