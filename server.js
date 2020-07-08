const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const data = require("./data.json");
const cors = require("cors");

// what you need to expect to understand client content
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.raw());

app.use(bodyParser.json());
app.use(cors());

let ids=[];
data.map(eachInformation => ids.push(Number(eachInformation.id)));

app.get("/", function (request, response) {
console.log(ids)
response.send('Ellie your server is working :)')
});

// increase id
const getRandomId = (arr) => {
  const randomId = Math.floor(Math.random() * (2 * data.length) + 6);
   if(arr.includes(randomId)){
    getRandomId(arr);
  }
  return randomId
} 

// Read all messages
app.get("/messages", function (req, res) {
  res.json(data);
});

// level 3
app.post("/messages/search", (req, res) => {
  const text = `${req.query.text.toLowerCase()}`;
  const messageWithSpecificText = data.filter((message) =>
    message.text.toLowerCase().includes(text)
  );
  res.json(messageWithSpecificText);
});

// level 3
app.get("/messages/latest", (req, res) => {
  if (data.length >= 10) {
    const latestMessages = data.slice(data.length - 10, data.length + 1);
    res.json(latestMessages);
  } else if (data.length < 10) {
    res.json(data);
  } else {
    res.json("Sorry,you do not have enough message");
  }
});

// Create a new message
app.post("/messages/newMessage", (req, res) => {
  // level 2
  console.log('body ', req.body)
  console.log(req.body.from)
  if (req.body.from === "" || req.body.text === "") {
    res
      .status(400)
      .json("Bad request,Please make sure all fields are filled in correctly");
  } else {
    // Here
    //question:
    //  if I want to have new id after those information I added to my data, how can I arrange my next id to be after this id I added(sorted ones)
    let randomId = getRandomId(data);
    data.push({
      id: randomId,
      from: req.body.from,
      text: req.body.text,
      timeSent: new Date(),
    });
    res.json(data);
  }
});

// read one message specified by an Id
app.get("/messages/:id", (req, res) => {
  const { id } = req.params;
  const messageWithSpecificId = data.filter((message) => message.id === id);
  res.json(messageWithSpecificId);
});

// Delete a message by Id
app.delete("/messages/:id", (req, res) => {
  const { id } = req.params;
  const messageWithSpecificId = data.filter((message) => message.id !== id);
  res.json(messageWithSpecificId);
});

// level 5
// add level 5 (put request)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
// ellie
