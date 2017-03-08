var fs = require('fs');

// API for configuration
module.exports = function(app){

    // route for writing something in the database
    app.post('/api/configuration', function(req, res){        
        fs.writeFile("config.json", JSON.stringify(req.body), function(error) {
            if(error) {
                app.broadcast(error, 'ERROR', 'GadgetronControl');
                res.json({
                    status: 'ERROR'
                })
                return;
            }

            app.broadcast("Saved config.json", 'INFO', 'GadgetronControl');
            if(!res.headersSent){
                res.json({
                    status: 'SUCCESS'
                })
            }
        });
    });
}