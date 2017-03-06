var spawn = require('child_process').spawn;

// API for configuration
module.exports = function(app){

    // route for writing something in the database
    app.post('/api/gadgetronControl/restart', function(req, res){
        res.send({
            status: 'SUCCESS'
        });

        var node = process.argv[0];
        process.argv.shift();
        var parameters = process.argv;
        spawn(node, parameters, {
                detached: true
            });

        process.exit(0);
    });
}