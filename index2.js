
var https = require('https');
var fs = require('fs');
const express = require('express');
const port = process.env.PORT || 8989;
const app = express();
var httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/butlerigor.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/butlerigor.ru/cert.pem')
};

var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
  port: 8081
});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);

    for (var key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";






app.use(express.json());
app.post('/', function (req, res) {
  if (req.body.request.command == "no text")
  {
    res.json({
      version: req.body.version,
      session: req.body.session,
      response: {
        text: "",
        end_session: false,
      },
    });
  }

  else if (req.body.request.command == "Привет")
  {
    res.json({
      session: req.body.session,
	  version: req.body.version,
      response: {
        text: 'Привет! Это я твой еще маленький помощник',
		end_session: false,
      },
    });
  }

  else if (req.body.request.command == "no session")
  {
    res.json({
      version: req.body.version,
      response: {
        text: 'Hello!',
        end_session: false,
      },
    });
  }

  else if (req.body.request.command == "отправь тестовое сообщение на сервер")
  {
    res.json({
      version: req.body.version,
      session: req.body.session,
      response: {
        text: 'Отправляю тестовое сообщение на сервер',
        end_session: false,
      },
    });
	message="тестовое сообщение";
	for (var key in clients) {
      clients[key].send(message);
    };
  }
  
  else if (req.body.request.command == "проверить где включен свет" || req.body.request.command == "Проверить где включен свет")
  {
    otvetProverki = "Свет сейчас включен в следующих помещениях:"
	const mongoClient = new MongoClient(url, { useNewUrlParser: true });
	mongoClient.connect(function(err, client){
    const db = client.db("test");
    const collection = db.collection("rooms");
    ligthOn = collection.find({light:1},{name: 1}).toArray(function(err, results){
        results.forEach(function(entry){
			if (entry.name == "IT-office") {
				otvetProverki=otvetProverki + "\nОтдел информационных технологий.";
			}
			if (entry.name == "Sales-office") {
				otvetProverki+="\nОтдел продаж.";
			}
		});  
        client.close();
		res.json({
		version: req.body.version,
		session: req.body.session,
		response: {
        text: otvetProverki,
        end_session: false,
      },
    });
    });
	
	});
	
 }
	
	else if ((req.body.request.command == "доступные помещения")||(req.body.request.command == "Доступные помещения"))
	{
	
    res.json({
      version: req.body.version,
      session: req.body.session,
      response: {
        text: 'В данный момент мне доступно управление в следующих помещениях: \n 1. Отдел информационных технологий \n 2. Отдел продаж',
        end_session: false,
      },
    });
	}
	
	else if (req.body.request.nlu.tokens[0] == "выключи" && req.body.request.nlu.tokens[1] == "свет" && req.body.request.nlu.tokens[2] == "в")
	{
		console.log(req.body.request.nlu.tokens);
		if ((req.body.request.nlu.tokens[3]=="отделе" && req.body.request.nlu.tokens[4]=="информационных" && req.body.request.nlu.tokens[5]=="технологий") || ((req.body.request.nlu.tokens[3]=="ИТ") && (req.body.request.nlu.tokens[4]=="отделе")) || ((req.body.request.nlu.tokens[3]=="Ит") && (req.body.request.nlu.tokens[4]=="отделе")) || ((req.body.request.nlu.tokens[3]=="ит") && (req.body.request.nlu.tokens[4]=="отделе")))
		{
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
			text: 'Выключаю свет в IT-отделе',
			end_session: false,
				},
			});
			const mongoClient = new MongoClient(url, { useNewUrlParser: true });
			mongoClient.connect(function(err, client){
				const db = client.db("test");
				const collection = db.collection("rooms");
				collection.updateOne({name:"IT-office"},{$set:{light:0}});
				client.close();
			});
			message="OFF";
			for (var key in clients) {
				clients[key].send(message);
			}
			
		}
			
		else if (req.body.request.nlu.tokens[3]=="отделе" && req.body.request.nlu.tokens[4]=="продаж")
		{
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
			text: 'Выключаю свет в отделе продаж',
			end_session: false,
				},
			});
			const mongoClient = new MongoClient(url, { useNewUrlParser: true });
			mongoClient.connect(function(err, client){
				const db = client.db("test");
				const collection = db.collection("rooms");
				collection.updateOne({name:"Sales-office"},{$set:{light:0}});
				client.close();
			});  
			
		}
		else {
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
          text: 'У меня еще нет власти над этим помещением, но я скоро и туда доберусь',
          end_session: false,
			},
			});
    
		}
		
	}
	
	else if (req.body.request.nlu.tokens[0] == "включи" && req.body.request.nlu.tokens[1] == "свет" && req.body.request.nlu.tokens[2] == "в")
	{
		console.log(req.body.request.nlu.tokens);
		if ((req.body.request.nlu.tokens[3]=="отделе" && req.body.request.nlu.tokens[4]=="информационных" && req.body.request.nlu.tokens[5]=="технологий") || ((req.body.request.nlu.tokens[3]=="ИТ") && (req.body.request.nlu.tokens[4]=="отделе")) || ((req.body.request.nlu.tokens[3]=="Ит") && (req.body.request.nlu.tokens[4]=="отделе")) || ((req.body.request.nlu.tokens[3]=="ит") && (req.body.request.nlu.tokens[4]=="отделе")))
		{
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
			text: 'Включаю свет в IT-отделе',
			end_session: false,
				},
			});
			const mongoClient = new MongoClient(url, { useNewUrlParser: true });
			mongoClient.connect(function(err, client){
				const db = client.db("test");
				const collection = db.collection("rooms");
				collection.updateOne({name:"IT-office"},{$set:{light:1}});
				client.close();
			});  
			message="ON";
			console.log(message);
			for (var key in clients) {
				clients[key].send(message);
			}
		}
		
	
		else if (req.body.request.nlu.tokens[3]=="отделе" && req.body.request.nlu.tokens[4]=="продаж")
		{
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
			text: 'Включаю свет в отделе продаж',
			end_session: false,
				},
			});
			const mongoClient = new MongoClient(url, { useNewUrlParser: true });
			mongoClient.connect(function(err, client){
				const db = client.db("test");
				const collection = db.collection("rooms");
				collection.updateOne({name:"Sales-office"},{$set:{light:1}});
				client.close();
			});  
			
		}
		else {
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
          text: 'У меня еще нет власти над этим помещением, но я скоро и туда доберусь',
          end_session: false,
			},
			});
    
		}
		
	}
	else if (req.body.request.command != "") 
	{
			res.json({
			version: req.body.version,
			session: req.body.session,
			response: {
          text: 'Я Вас не понял, вот какие команды сейчас доступны:\n 1.Выключи(включи) свет в (название помещения)\n 2. Доступные помещения \n 3. Проверить где включен свет \n Данный навык является закрытым',
          end_session: false,
			},
			});
    
		}
	
  else 
  {
    res.json({
      version: req.body.version,
      session: req.body.session,
        response: {
          text: 'Привет, я Дворецкий Игорь, вот какие команды сейчас доступны:\n 1.Выключи(включи) свет в (название помещения)\n 2. Доступные помещения \n 3. Проверить где включен свет \n Данный навык является закрытым',
          
          end_session: false,
        },
    })
  ;}
});

app.use('*', function (req, res) {
  res.sendStatus(404);
});

https.createServer(httpsOptions, app).listen(port);

