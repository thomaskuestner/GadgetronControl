var WebSocketServer = require('ws').Server;

// defines websockets
module.exports = function(app){
    // WebSocket for logging
    var wss = new WebSocketServer({ server: app.server , path: '/logbroadcast'});
        app.broadcast = function broadcast(data, loglevel, sender) {
        // parse message for loglevel case insensative (-i) when loglevel isn't set
        if(typeof loglevel === 'undefined'){
            var debug = new RegExp('DEBUG', 'i');
            var error = new RegExp('ERROR', 'i');
            if(data.match(debug)){
                loglevel = 'DEBUG';
            }
            else if(data.match(error)){
                loglevel = 'ERROR';
            }
            else{
                loglevel = 'INFO';
            }
        }
        wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({data: data, loglevel: loglevel, sender: sender}));
        });
    };

    // WebSocket for gadgetron state
    var wssGadgetronStatus = new WebSocketServer({ server: app.server , path: '/gadgetronstate'});
        app.broadcastGadgetronStatus = function broadcastGadgetronStatus(data) {
        wssGadgetronStatus.clients.forEach(function each(client) {
            client.send(JSON.stringify(data));
        });
    };
}