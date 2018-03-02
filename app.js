const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  rp = require('request-promise');

//   const
//   APP_SECRET = process.env.APP_SECRET,
//   VERIFY_TOKEN = process.env.VERIFY_TOKEN,
//   ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const
   APP_SECRET = '790c7af3b7b2295488a9858d9b2c0077',
   VERIFY_TOKEN = '123',
   ACCESS_TOKEN = 'DQVJ2U1dXSW54TTFGVnNzVnlmMVdvRjluZAWpDVGVDMjY2RHNNUXNEZAmxvWjVzVXRpVU1kMlpTdWQ2bDBDa280YXU1aEF0OW9kbkFCdkRBdG43S1VWY0szd1JDaXhIak4zbEt0b2JDb09nSkI0MlZABRE1LYjdQSm02ZAEtweVg3NDlYdGthc1lhT1BYeG9iVDJGVnhmM1czemh1SHMyZA3c5T2dxWTc1UHNYWWcyQk9nZAFZAfU29FTG1oZAFdkOS1TbWpEaUNzY3hVOU5DdXpGYm92ZAwZDZD';

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
    console.log('processPAGEEVENT--');
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

function getDate(){
    var data = new Date();
    return data.toLocaleDateString('pt-br', {timezone: 'Brazil/brt'});
}

function foiVerificado(id) {
    console.log('4444 --- Teste--');
    return new Promise((resolve, reject)=>{
        console.log('foi verificado--',getDate());

        let endpoint = 'https://graph.facebook.com/1406581722734258/members?fields=id,name,account_invite_time'; 
        
        console.log('endpoint--',endpoint);

        rp({
            url: endpoint,
            headers: {
                Authorization: 'Bearer ' + ACCESS_TOKEN
            },
            json: true
            })
        .then(function (res) {
           // console.log(res.data);
           console.log('5555 --- Teste--');
            let filtro = res.data.filter((data) => {return data.id === id});
            
            let dataDoConvite = new Date(filtro[0].account_invite_time).toLocaleDateString('pt-br', {timezone: 'Brazil/brt'});

            // confere se a data do convite é igual a data de hoje
            if(dataDoConvite === getDate()) {
                console.log('6666 --- Teste--');
                resolve(true);
            } else {
                resolve(false);
            }
            
        })
        .catch(function (err) {
            reject();
            console.log('err');
        });
    });
}

function processGroupEvents(data) {

    console.log('1111 --- Teste--');
    console.log('processGroupEvents--');
    let idUserAdd = '';
    data.entry.forEach(function(entry){

        entry.changes.forEach(function(change){

            if (change.field === 'membership') {
                if (!change.value.actor) {
                
                    if (change.value.verb = 'add') {
                        idUserAdd = change.value.member.id;
                        console.log('2222 --- Teste--');
                        validaNovo(idUserAdd);
                    }
                }
            }

        });

    });

    // console.log('processGroupEvents--(data.entry)',data.entry);

    // data.entry.forEach(function(entry){
        
    //     let idUserAdd = '';

    //     entry.changes.forEach(function(change){

    //     //change 
    //     if (change.field === 'membership') {
    //         if (!change.value.actor) {
            
    //             if(change.value.verb = 'add'){
    //                 idUserAdd = change.value.member.id;

    //                 console.log('idUserAdd Pessoa inserida--', idUserAdd);

    //                 setGroups(idUserAdd);
    //             }
    //         }
    //     }

    //     console.log('Group Change',change);
    //     });
    // });
}

app.get('/teste', function(req, res) {
    console.log('chamou o teste');
    processGroupEvents();
    res.send('Teste!')
});

function validaNovo(id){
    console.log('3333 --- Teste--');
    // atraves do verificado eu sei se a conta é nova
    foiVerificado(id).then(function(data) { 
        if (data) {
            console.log('7777 --- Teste--');
            console.log('deu DATA true--');
            setGroups(id);
        } else {
            
            console.log('deu DATA false--');
        }
    }).catch(function(){
        console.log('err call');
    });


}

function setGroups(id) {
    // Grupos: stefanini 754 , suporteTI 116, comunicado 125, umc, transformacao
    let groups_id = [
        '754959588048552',
        '1164556426999867',
        '1258339934284192',
        '119771951980956',
        '2050634305179034'
    ];

    let userId = id;

    groups_id.forEach(function(group_id){

        let endpoint = 'https://graph.facebook.com/' + group_id + '/members/' + userId; 
        
        console.log('8888 --- Teste--');
        console.log(endpoint);
        rp({
            url: endpoint,
            headers: {
                Authorization: 'Bearer ' + ACCESS_TOKEN
            },
            method:'POST',
            json: true
            })
        .then(function (res) {
            console.log('9999 --- Teste--');
            console.log('success Insert groups', res);
        })
        .catch(function (err) {
            console.log('err');
        });

    });
}

function processUserEvents(data) {
    console.log('processUserEvents--');
    data.entry.forEach(function(entry){
        let group_id = entry.id;
        entry.changes.forEach(function(change){
        console.log('User Change',group_id,change);
        });
    });
}

function processWorkplaceSecurityEvents(data) {
    console.log('processWorkplaceSecurityEvents--');
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