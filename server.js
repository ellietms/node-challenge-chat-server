const dotenv =require("dotenv");
const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
const cors = require("cors");
const mongodb = require("mongodb");
dotenv.config();
const uri =process.env.DATABASE_URI;
const PORT = process.env.PORT || 3000;
// what you need to expect to understand client content
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.raw());
app.use(express.json());
app.use(cors());

app.get("/", function (request,response) {
  const client = new mongodb.MongoClient(uri)
  client.connect(() => {
    response.send("Ellie your server is working :)");
    client.close();
  })
});

// Read all messages
app.get("/messages", function (request,response) {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    collection.find().toArray((error,messages) => {
      if(error){
        response.send(error);
        client.close();
      }
      else{
      response.json(messages);
      client.close();
      }
    })
  })
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

// increase id
function NewId(arr) {
  if (arr.length !== 0) {
    return Math.max(...Object.values(arr.map((e) => e.id))) + 1;
  } else {
    return 0;
  }
}

// Create a new message
app.post("/messages/newMessage", (req, res) => {
  // level 2
  if (req.body.from === "" || req.body.text === "") {
    res
      .status(400)
      .json("Bad request,Please make sure all fields are filled in correctly");
  } else {
    let id = NewId(data).toString();
    data.push({
      id: id,
      from: req.body.from,
      text: req.body.text,
      timeSent: new Date(),
    });
    res.json(data);
    console.log(data);
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
  console.log("the id is :", id, typeof id, JSON.stringify(data));
  data = data.filter((message) => message.id !== id);
  res.json(data);
});

// level 5
// add level 5 (put request)
app.put("/messages/:id", (req, res) => {
  const { id } = req.params;
  let updateData = data.find((message) => message.id === id);
  if (updateData) {
    updateData.text = req.body.text;
    updateData.from = req.body.from;
    res.json(data);
  } else {
    res.send(404).status("oops! something went wrong! :(");
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
