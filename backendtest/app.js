const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
var app = express();
var rp = require('request-promise');
var http =  require('http');
var https =  require('https');

const fs = require('fs');
var cors = require('cors')
app.use(cors())
app.options('*', cors())

//Configuring express server
app.use(bodyparser.json());

app.use(bodyparser.urlencoded({ extended: true }));

//MySQL details
var mysqlConnection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'root',
database: 'testdb',
multipleStatements: true
});

mysqlConnection.connect((err)=> {
if(!err)
{
console.log('Connection Established Successfully');
    global.db = mysqlConnection;
}
else
{
console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
}
});

// app.use('/getData', require('./api/controllers/testController'));

app.get('/getData',(req,res)=> {
    //   res.send('Get Data page');
    var parameter = {'zipcode':33186}

    rp({
    method: 'get',
    uri: 'http://lms.labyrinthelab.com/api/ws_get_zipcode_details.php?zipcode=33186',
    headers: {
      'access_token':'ZiPcoDeDetAiLs'
    }
  }).then(function (data) {
    console.log("login DATA : ", data)
    responseData = JSON.parse(data).RESPONSE_DATA;
    console.log("responseData ",responseData)

    var updateQuery = `INSERT INTO respdata (state_id,city_name,city_id,state_name,county_id,country_name,file_url)
    values ('${responseData.state_id}', 
                        '${responseData.city_name}', 
                        '${responseData.city_id}', 
                        '${responseData.state_name}', 
                        '${responseData.country_id}', 
                        '${responseData.country_name}', 
                        '${responseData.file_url}');`;

console.log(updateQuery)

db.query(updateQuery, (err, results) => {
  if (err != null){
      console.log("Error ",err);
  }
  else
  {
      var fileName = responseData.file_url.split('/');
       const file = fs.createWriteStream(fileName[fileName.length-1]);
const request = https.get(responseData.file_url, function(response) {
  response.pipe(file);
  res.send("Success")
});
  }
  })


  })
})


app.get('/getTableData',(req,res)=> {
    //   res.send('Get Data page');

    var updateQuery = `select * from respData`;

console.log(updateQuery)

db.query(updateQuery, (err, results) => {
  if (err != null){
      console.log("Error ",err);
  }
  else
  {
  res.send(results)
}
});
})

//Establish the server connection
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 3001;
app.listen(port, () => {console.log(`Listening on port ${port}..`)});