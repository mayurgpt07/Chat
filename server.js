var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;
var express = require('express');
var app = express();
var path = require('path');

var uri = 'mongodb://localhost:27017/chat';
mongo.connect(uri,function(err, db) { //connect tomongodb using mongoose//
 if(err) throw err;
app.get('/',function(req , res) {
  res.sendFile(path.join(__dirname + '/index.html'));
 });                                          //setting the index.html//
app.get('/styles/main.css', function(req , res) {
  res.sendFile(__dirname + '/styles/main.css');
});                                        //loading the css files//
app.listen(8082);
   client.on('connection', function(socket) { //on connection//

      var col = db.collection('messages');
       var  sendStatus = function(s){
     socket.emit('status',s);
  };
    col.find().limit(100).sort({_id:1}).toArray(function(err,res) {
    if(err) throw err;
    socket.emit('output',res); 
   });

     socket.on('input',function(data){
      var  name = data.name ,
                  message = data.message,
                    image_url = data.image_url;
      var doc = {name : data.name , message : data.message,image_url:data.image_url};  //data base entry file//
      var space = /^\s*$/;
      if(space.test(name)||(space.test(message) && !(space.test(image_url)))) //check for empty fields
        {
         sendStatus({ message : "Fill the message",
                        clear : true
           });
        }
     else
       {
      col.insert(doc , function(error , result) {
           
           client.emit('output',[data]);     
           sendStatus({ message : "sent",
                        clear : true
           });
        });
       }
      });
   });
 });




