var path = require('path');
var mv = require('mv');
var fs = require('fs');

// file to trash api
module.exports = function(app, config){
    // route for moving file to trash
    app.post('/api/fileToTrash', app.requireRole('admin'), function(req, res){
        var fileName = req.body.fileName;
        var trashFileName = path.join(config.trash_dir, fileName);
        mv(fileName, trashFileName, {mkdirp: true}, function(error){
            if(error){
                app.broadcast(JSON.stringify(error), 'ERROR');
                res.json({status: false});
            }
            else{
                app.broadcast('moved ' + fileName + ' to trash', 'SUCCESS');
                res.json({status: true});
            }
        });
    });

    // route for deleting file
    app.delete('/api/fileToTrash', app.requireRole('admin'), function(req, res){
        var fileName = req.body.fileName;
        fs.unlink(fileName, function(error, stats){
            if(error){
                app.broadcast(JSON.stringify(error),'ERROR');
                res.json({status: false});
            }
            else{
                app.broadcast('deleted ' +  fileName, 'SUCCESS');
                res.json({status: true});
            }
        });
    });

    // route for restore file
    app.post('/api/restoreFileFromTrash', function(req, res){
        var fileName = req.body.fileName;
        var restoreFileName = fileName.replace(config.trash_dir + '/','');
        mv(fileName, restoreFileName, {mkdirp: true}, function(error){
            if(error){
                app.broadcast(JSON.stringify(error), 'ERROR');
                res.json({status: false});
            }
            else{
                app.broadcast('moved ' + fileName + ' back', 'SUCCESS');
                res.json({status: true});
            }
        });
    });
}