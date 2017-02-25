var fs = require('fs');
var recursive = require('recursive-readdir');
var mkdirp = require('mkdirp');

// API for database
module.exports = function(app){
    // route for getting content of a folder
    app.get('/api/getFolder', function(req, res){
        var path = req.query.folderPath;
        mkdirp(path, function(error){
            if(error){
                app.broadcast(error);
                res.json(error);
            }
            else{
                recursive(path, function(error, files) {
                    if(error){
                        app.broadcast(error);
                        res.json(error);
                    }
                    else{
                        if(files){
                            files.map(function(file, index, array){
                                array[index] = file.replace(path,'');
                            })
                        }
                    }
                    res.json(files);
                });
            }
        })
    });
}