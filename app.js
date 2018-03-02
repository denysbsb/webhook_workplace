const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express');

  const
  APP_SECRET = process.env.APP_SECRET,
  VERIFY_TOKEN = process.env.VERIFY_TOKEN,
  ACCESS_TOKEN = process.env.ACCESS_TOKEN;

//   if (!(APP_SECRET && VERIFY_TOKEN && ACCESS_TOKEN)) {
//     console.error('Missing config values');
//     process.exit(1);
//   }

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({ verify: verifyRequestSignature }));

/*
 * Verify that the callback from Facebook.
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers['x-hub-signature'];

    console.log('Verify Signature call');
  
    if (!signature) {
      // For testing, let's log an error. In production, you should throw an
      // error.
      console.error('Couldn\'t validate the signature.');
    } else {
      var elements = signature.split('=');
      var signatureHash = elements[1];
  
      var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');
  
      if (signatureHash != expectedHash) {
        throw new Error('Couldn\'t validate the request signature.');
      }
    }
}

app.set('port', process.env.PORT || 5000);

app.get('/hello', function(req, res) {
    console.log('Hello console');
    res.send('Hello World!')
});

/*
*
* Check that the verify token in the webhook setup is the same token
*
*/

app.get('/', function(req, res) {
    console.log('Verify Token get');
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VERIFY_TOKEN) {
      console.log('Validating webhook');
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error('Falha na validação. Verifique a validação ed token.');
      res.sendStatus(403);
    }
});

app.post('/', function (req, res) {
    console.log('Post webhook call --');
    try {
        var data = req.body;
        switch (data.object) {
                case 'page':
                processPageEvents(data);
                break;
                case 'group':
                processGroupEvents(data);
                break;
                case 'user':
                processUserEvents(data);
                break;
                case 'workplace_security':
                processWorkplaceSecurityEvents(data);
                break;
                default:
                console.log('Unhandled Webhook Object', data.object);
        }
    } catch (e) {
        console.error(e);
    } finally {
        console.log('Finally post call');
        res.sendStatus(200);
    }
});

function processPageEvents(data) {
    data.entry.forEach(function(entry){
        let page_id = entry.id;
            // Chat messages sent to the page
        if(entry.messaging) {
        entry.messaging.forEach(function(messaging_event){
            console.log('Page Messaging Event',page_id,messaging_event);
        });
        }
            // Related in pages or changes mentions of page
        if(entry.changes) {
        entry.changes.forEach(function(change){
            console.log('Page Change',page_id,change);
        });
        }
    });
}

function processGroupEvents(data) {
    data.entry.forEach(function(entry){
        let group_id = entry.id;
        entry.changes.forEach(function(change){
        console.log('Group Change',group_id,change);
        });
    });
}

function processUserEvents(data) {
    data.entry.forEach(function(entry){
        let group_id = entry.id;
        entry.changes.forEach(function(change){
        console.log('User Change',group_id,change);
        });
    });
}

function processWorkplaceSecurityEvents(data) {
    data.entry.forEach(function(entry){
        let group_id = entry.id;
        entry.changes.forEach(function(change){
        console.log('Workplace change security',group_id,change);
        });
    });
}

//Start server
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});