var ps = require('ps-node');
var tail = require('tail').Tail;
var fs = require('fs');

// handels all gadgetron stuff
module.exports = function(app, config, autoconfig){
    var iFrequency = 500; // expressed in miliseconds
    var myInterval = 0;

    // send gagetronState every 500ms
    function sendGadgertonState() {
        if(myInterval > 0) {
            clearInterval(myInterval);
        }  // stop
        myInterval = setInterval( function(){
            ps.lookup({
                command: '\^gadgetron\$',
                }, function(err, resultList ) {
                if (err) {
                    throw new Error( err );
                }
                resultList.forEach(function( gadgetronProcess ){
                    if( gadgetronProcess ){
                        var portIndex = gadgetronProcess.arguments.indexOf('-p')
                        if(portIndex === -1){
                            app.autoconfig.gadgetron_port = 9002; // replace by config.gadgetron_port?
                        }
                        else{
                            app.autoconfig.gadgetron_port = gadgetronProcess.arguments[portIndex + 1];
                        }
                        app.broadcastGadgetronStatus({processId: gadgetronProcess.pid, processCommand: gadgetronProcess.command, processArgument: gadgetronProcess.arguments, state: 'on' });
                    }
                });
                if(resultList.length === 0){
                        app.broadcastGadgetronStatus({processId: 0, processCommand: '', processArgument: '' , state: 'off' });
                }
            });
        }, iFrequency );  // run
    }
    sendGadgertonState();

    // watch gadgetron log file
    // check if file exists
    fs.exists(config.gadgetron_log, function(exists){
        if(exists){
            tail = new tail(config.gadgetron_log);

            tail.on("line", function(data) {
                app.broadcast(data, null, 'gadgetron');
            });
        }
    })
}
