const dotenv = require("dotenv");
const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
dotenv.config();
const uri = process.env.DATABASE_URI;
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// what you need to expect to understand client content
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.raw());

// increase id
// function NewId(arr) {
//   if (arr.length !== 0) {
//     return Math.max(...Object.values(arr.map((e) => e.id))) + 1;
//   } else {
//     return 0;
//   }
// }

app.get("/", function (request, response) {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    response.send("Ellie your server is working :)");
    client.close();
  });
});

// Read all messages
app.get("/messages", function (request, response) {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    collection.find().toArray((error, messages) => {
      if (error) {
        response.send(error);
        client.close();
      } else {
        response.json(messages);
        client.close();
      }
    });
  });
});

// Find specific data with specific text
app.post("/messages/search", (request, response) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    const text = `${request.query.text.toLowerCase()}`;
    collection.find().toArray((error, data) => {
      if (error) {
        response.send(error);
        client.close();
      } else {
        const messageWithSpecificText = data.filter((message) =>
          message.text.toLowerCase().includes(text)
        );
        response.send(messageWithSpecificText);
        client.close();
      }
    });
  });
});

//find latest data
app.get("/messages/latest", (request, response) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    collection.find().toArray((error, data) => {
      if (data.length >= 10) {
        const latestMessages = data.slice(data.length - 10, data.length + 1);
        response.send(latestMessages);
        client.close();
      } else if (data.length < 10) {
        response.send(data);
        client.close();
      } else {
        response.send("Sorry,you do not have enough message");
        client.close();
      }
    });
  });
});

// Create a new message
app.post("/messages/newMessage", (request, response) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    const message = {
      from: request.body.from,
      text: request.body.text,
      timeSent: new Date()
    };
    collection.insertOne(message, (error, data) => {
      if (request.body.from === "" || request.body.text === "") {
        response
          .status(400)
          .send(
            "Bad request,Please make sure all fields are filled in correctly"
          );
        client.close();
      }
      else if (error) {
        response.send(error);
        client.close();
      }
      else {
        response.send(data.ops[0]);
        client.close();
      }
    });
  });
});

// read one message specified by an Id
app.get("/messages/:id", (request, response) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    const { id } = request.params;
    let newId;
    if(mongodb.ObjectID.isValid(id)){
     newId = mongodb.ObjectID(id);
     console.log("TYPE",typeof newId);
     collection.findOne({_id:newId},(error,data) => {
      if(error){
        response.send(error);
        client.close();
      }
      else{
        console.log("DATA" , data)
        response.send(data);
        client.close();
      }
    })
  }
  else{
    response.send("Id is not Valid");
    client.close();
  }
  })
});

// Delete a message by Id
app.delete("/messages/:id", (request, response) => {
  const client = new mongodb.MongoClient(uri,{useUnifiedTopology: true});
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    const { id } = request.params;
    let newId;
    if(mongodb.ObjectID.isValid(id)){
      newId = mongodb.ObjectID(id);
      collection.deleteOne({_id:newId},(error,data) => {
        if(error){
          response.send(error);
          client.close();
        }
        else{
          response.send("Successfully removed");
          client.close();
        }
      })
    }
    else{
      response.send("ID is not valid");
      client.close();
    }
  })
});

// level 5
// Update information by Id;
app.put("/messages/:id", (request,response) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("chat");
    const collection = db.collection("messages");
    const {id} = request.params;
    let newId;
    if(mongodb.ObjectID.isValid(id)){
      newId = new mongodb.ObjectID(id);
      const searchObject = {_id:newId};
      const updateObject = {
        $set:{
          text:request.body.text,
          from:request.body.from
        },
      };
      const options={ returnOriginal: false };
      collection.findOneAndUpdate(searchObject,updateObject,options,(error,result) => {
        if(error){
          response.send(error);
          client.close();
        }
        else{
          response.send(result.value);
          client.close();
        }
      })
    }
    else{
      response.send("oops! something went wrong! :(");
      client.close();
    }  
  })
});
 

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
