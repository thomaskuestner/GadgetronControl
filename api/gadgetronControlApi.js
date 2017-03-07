var spawn = require('child_process').spawn;
var fs = require('fs');
// load config file
var config = require('./../config.json');

// API for configuration
module.exports = function(app){

    // route for writing something in the database
    app.post('/api/gadgetronControl/restart', function(req, res){
        // check if gadgetron is already running in background
        // from websocket or app.broadcastGadgetronStatus
        /*if (running) {
          var killer = spawn('kill',['PID']); // do we need a separate gadgetrconServer.kill() if it is started from GadgetronControl?
        }  */
        var gadgetronServer = spawn('gadgetron',['-p', config.gadgetron_port, '-r', config.gadgetron_relay_host, '-l', config.gadgetron_relay_port]);
        var logstream = fs.createWriteStream(config.gadgetron_log, {flags: 'a'});
        gadgetronServer.stdout.pipe(logstream);
        gadgetronServer.stderr.pipe(logstream);

        // not needed -> read from file
        /*gadgetronServer.stdout.on('data', function(data){
            app.broadcast(data.toString(), null, 'gadgetron');
        });
        gadgetron.stderr.on('data', function(data){
            errorFlag = true;
            app.broadcast(data.toString(),'ERROR', 'gadgetron');
            if(!res.headersSent){
                res.json({status: 'false'});
            }
        }, this);*/

        gadgetron.on('uncaughtException', function(err){
          app.broadcast((err && err.stack) ? err.stack : err,'ERROR','gadgetron');
        });

        res.send({
            status: 'SUCCESS'
        });

        /*var node = process.argv[0];
        process.argv.shift();
        var parameters = process.argv;
        spawn(node, parameters, {
                detached: true
            });

        process.exit(0);*/
    });
}
