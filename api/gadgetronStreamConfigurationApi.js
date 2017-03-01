var fs = require('fs');
var recursive = require('recursive-readdir');
var path = require('path');

// API for gadgetronStreamConfiguration
module.exports = function(app, config){
    app.configurationList = new Array;
    // route for getting StreamConfiguration-Files
    // only read directory at first access and if filewatcher detacted changes
    app.get('/api/gadgetronStreamConfiguration', function(req, res) {
        if(app.configurationList.length > 0){
            res.json(app.configurationList);
        }
        else{
            readConfigurationDir(config.config_dir, app.configurationList, function(){
                res.json(app.configurationList);
            });
        }
    });

    // route for saving configuration file
    app.post('/api/gadgetronStreamConfiguration', function(req, res) {
        var savePath = config.config_dir + req.body.fileName;
        fs.writeFileSync(savePath, req.body.content);
        app.broadcast('saved ' + savePath, 'SUCCESS');
        res.json({status: 'saved'});
    });

    // iterate recursivly over all files in config_dir
    function readConfigurationDir(config_dir, configurationList, callback){
        recursive(config.config_dir, function(error, files) {
            if (error) {
                throw error;
            }
            readConfigurationFile(0, files, configurationList, function(){
                callback();
            });
        });
    }

    // extract XML-Files
    function readConfigurationFile(index, files, configurationList, callback){
        if(index < files.length){
            if (path.extname(files[index]) === ".xml") {
                readConfigurationFileContent(files[index], configurationList, function(){
                    readConfigurationFile(index + 1, files, configurationList, callback);
                });
            }
            else {
                readConfigurationFile(index + 1, files, configurationList, callback);
            }
        }
        else {
            callback();
        }
    }

    // read file content and save it in configurationList
    function readConfigurationFileContent(fileName, configurationList, callback){
        fs.readFile(fileName, 'utf8', function(error, content){
            if (error) {
                throw error;
            }
            configurationList.push({path: fileName, configurationName: fileName.replace(config.config_dir,''), content: content.trim()});
            callback();
        });
    }

    // check for changes in config_dir
    fs.watch(config.config_dir, function(event, filename){
        app.configurationList = new Array;
    });
}