// catches uncaughtExceptions
module.exports = function(config){
    process.on('uncaughtException', function(error) {
        // is thrown, when the port is already taken
        if(error.errno === 'EADDRINUSE'){
            console.log('Probably the port ' + config.port + ' is already in use. Check with fuser ' + config.port + '/tcp')
            console.log(error);
        }
        else{
            console.log(error);
        }
        process.exit(1);
    });  
}