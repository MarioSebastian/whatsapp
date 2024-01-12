const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(8080, () => {
  console.log("Application listening on port 8080!");
});

//Whatsapp Sender
const whatsapp = require("./z_functions/whatsapp/whatsapp");
app.post("/sendWhatsappNumber", (req, res) => {
  whatsapp.sendWhatsappNumber(req.body.phoneNumber, req.body.message, res);
});
app.post("/sendWhatsappGroupMessage", (req, res) => {
  whatsapp.sendWhatsappGroupMessage(req.body.groupName, req.body.message, res);
});

// app.post("/sendWhatsappMassNumber", (req, res) => {
//   whatsapp.sendWhatsappMassNumber(req.body.phoneNumberList, req.body.message, res)
// });
// app.post("/sendWhatsappMassGroupMessage", (req, res) => {
//   res.send(
//     whatsapp.sendWhatsappMassGroupMessage(
//       req.body.groupNameList,
//       req.body.message
//     )
//   );
// });
// app.get("/test", (req, res) => {
//   res.send("server ok");
// });
