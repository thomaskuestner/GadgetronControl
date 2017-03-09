var spawn = require('child_process').spawn;
var fs = require('fs');
var ps = require('ps-node');

// API for configuration
module.exports = function(app, config){

    // route for writing something in the database
    app.post('/api/gadgetron/restart', function(req, res){
        app.restartGadgetron();
        res.send({
            status: 'SUCCESS'
        });
    });

    app.restartGadgetron = function(){
        ps.lookup({
            command: '\^gadgetron\$',
            }, function(err, resultList ) {
            if (err) {
                throw new Error( err );
            }
            resultList.forEach(function( gadgetronProcess ){
                if( gadgetronProcess ){
                    spawn('kill',['-9', gadgetronProcess.pid]);
                    app.broadcast('killed gadgetron process with pid ' +  gadgetronProcess.pid, 'SUCCESS', 'gadgetron');
                }
            });
            var gadgetronServer = spawn('gadgetron',['-p', config.gadgetron_port, '-r', config.gadgetron_relay_host, '-l', config.gadgetron_relay_port]);
            var logstream = fs.createWriteStream(config.gadgetron_log, {flags: 'a'});
            gadgetronServer.stdout.pipe(logstream);
            gadgetronServer.stderr.pipe(logstream);
            app.broadcast('started gadgetron', 'SUCCESS', 'gadgetron');

            gadgetronServer.on('uncaughtException', function(err){
                app.broadcast((err && err.stack) ? err.stack : err,'ERROR','gadgetron');
            });
        });
    }
}
