//var {dialog} = require('electron');
const electron = require('electron');
const remote = electron.remote;
//const mainProcess = remote.require('./../main'); // cannot get access back to main

// API for electron specific stuff
module.exports = function(app){
    // route for open file dialog and responses with path
    app.get('/api/getFilePath', function(req, res){
        var fileNames = mainProcess.openFile();
        //console.log('Inside callback');
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
        /*dialog.showOpenDialog({properties: ['openFile']}, function (fileNames) {
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
        })*/
    });
}
