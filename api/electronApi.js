const fs = require('fs');
// API for electron specific stuff
module.exports = function(app){
    var response;
    // route for open file dialog and responses with path
    app.get('/api/getFilePath', function(req, res){
        response = res;
        process.send('openDialog', function(fileNames){
        });
    });

    process.on('message', function(data) {
        if(data){
            response.json({
                status: 'SUCCESS',
                filePath: data
            });
        }
        else{
            response.json({
                status: 'ERROR'
            });
        }
    });
}
