const fs = require('fs');

// API for electron specific stuff
module.exports = function(app){
    // route for open file dialog and responses with path
    app.get('/api/getFilePath', function(req, res){
        process.send('openDialog', function(fileNames){
            //var fileNames = fs.createReadStream(null, {fd: 3});
            if(fileNames){
              //console.log(fileNames);
              res.json({
                  status: 'SUCCESS',
                  filePath: filePath
              });
            }
            else{
              res.json({
                  status: 'ERROR'
              });
            }
        });
    });
}
