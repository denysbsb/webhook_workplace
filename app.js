const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express');

  const
  APP_SECRET = process.env.APP_SECRET,
  VERIFY_TOKEN = process.env.VERIFY_TOKEN,
  ACCESS_TOKEN = process.env.ACCESS_TOKEN;

var app = express();

app.get('/hello', function(req, res){
    res.send('Hello World!')
});

app.set('port', process.env.PORT || 5000);

//Start server
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});