var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: //yourpassword,
    database: "pubsubtest", //yourdatabase
    port: //yourportnumber
});

var sendMessage = function (sid, message) {
    var connect = socketsMap.get(sid);
    //console.log(sid);
    if(socketsMap.has(sid)){
        console.log("YES");
    connect.send(
      JSON.stringify({
        message: message,
      })
    );
    console.log("sending message"+sid);
    // socketsMap.delete(sid);
    }
    //console.log("Hello World!!");
  };

var socketsMap = new Map();

class PubSubManager {
  constructor() {
    this.topics = ["weather", "sports","foreignAffairs","health","environment","studies","jewellery","trips"];
    this.brokerId = setInterval(() => {
      this.broker();
    }, 1000);
  }
  subscribe(sid, subscriber, topic) {
    console.log(`subscribing to ${topic}`);
    var sql = `INSERT INTO subscriber(sid,topic) VALUES ( '${sid}', '${topic}')`;
    con.query(sql);
    socketsMap.set(sid, subscriber);
  }

  removeBroker() {
    clearInterval(this.brokerId);
  }

  publish(pid, publisher, topic, message) {
    var sql = `INSERT INTO publisher VALUES ( '${pid}' , '${topic}', '${publisher}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("query runned successfully");
    });
    // Update with previous message
    // var msg = "";
    // var sql = `SELECT message FROM topic WHERE topic =  '${topic}'`;
    // con.query(sql,function(err,result){
    //     if(err)
    //       throw err;
    //     msg = result[0].message;
    //     console.log(msg.concat("\n",message));
    //     var sqlquery = `UPDATE topic SET message =  '${msg.concat("\n",message)}' WHERE topic = '${topic}'`;
    //     con.query(sqlquery);
    // });
    var sqlquery = `UPDATE topic SET message =  '${message}' WHERE topic = '${topic}'`;
    con.query(sqlquery);
   
  }

  broker() {
    var sql1 = `SELECT topic FROM topic`;
    con.query(sql1,function(err,result){
        if(err) throw err;
        if(result.length>0){
            for(var i=0;i<result.length;i++){
                let topicName = result[i].topic;
                //console.log(topicName);
      
                var sql = "select message from topic where topic= '"+topicName+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    //if results are there for a paticular query
                    if (result.length > 0) {
                    let message = result[0].message;
                    // If message is being published for a particular topic
                    
                    if (message) {
                        //fetch all the subscribers from subscriber table
                        //"UPDATE pubsubtest.topic SET message = '"+message+"' WHERE topic = '"+channel+"'";
                        // sql = `select sid as sid from subscriber where topic = '${topicName}'`;
                        sql = "select sid as sid from subscriber where topic = '"+topicName+"'";
                        con.query(sql, function (err, result) {
                        if (err) throw err;
                        //console.log(result);
                        //for each subscriber send the message
                        for (var i = 0; i < result.length; i++) {
                            // global method to send data to subscriber
                            sendMessage(result[i].sid, message);
                            sql = `update topic set message = "" where topic = '${topicName}'`;
                            con.query(sql);
                            
                        }
                        });
                    }
                    }
                });
            } 
        }
    });

    
   
  }
}
module.exports = PubSubManager;
