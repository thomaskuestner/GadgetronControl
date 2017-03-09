var {dialog} = require('electron');

// API for electron specific stuff
module.exports = function(app){
    // route for open file dialog and responses with path
    app.get('/api/getFilePath', function(req, res){
        dialog.showOpenDialog({properties: ['openFile']}, function (fileNames) {
          console.log('Inside callback');
          if(fileNames){
            console.log(fileNames);
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
        })
    });
}