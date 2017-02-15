var formidable = require('formidable');
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

// API for uploading files
module.exports = function(app, config){
    // Route for Uploading Data
    app.post('/api/upload', function(req, res){
        var fileName;
        var extension;
        var destinationPath;
        var waitOnConverstion = false;
        // create an incoming form object
        var form = new formidable.IncomingForm();
        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;
        // store all uploads in the /uploads directory
        app.mkdir(config.upload_dir);
        form.uploadDir = config.upload_dir;
        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function(field, file) {
            extension = file.name.split('.').pop();
            fileName = file.name.split('.').shift();
            app.mkdir(path.join(form.uploadDir, extension));;
            switch (extension) {
            case 'dat':
                // set wait on conversion
                waitOnConverstion = true;
                destinationPath = path.join(form.uploadDir + '/' + extension, file.name);
                var destinationH5Path = path.join(form.uploadDir + '/h5', fileName + '.h5');
                fs.rename(file.path, destinationPath);
                // start convertion with siemens_to_ismrmrd
                var siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', destinationPath, '-o', destinationH5Path]);
                siemensToIsmrmd.stdout.on('data',function(data){
                    app.broadcast(data.toString());
                });
                siemensToIsmrmd.on('close', function(code){
                    app.broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS');
                    app.broadcast('uploaded ' + fileName, 'SUCCESS');
                    res.json({
                        extension: extension, 
                        filename: fileName + '.' + extension,
                        path: destinationPath,
                        status: true
                    });
                });
                siemensToIsmrmd.stderr.on('data', function(data){
                    app.broadcast(data.toString());
                });
                break;
            case 'h5':
            case 'xsl':
                destinationPath = path.join(form.uploadDir + '/' + extension, file.name);
                fs.rename(file.path, destinationPath);
                break;
            case 'xml':
                destinationPath = path.join(form.uploadDir + '/' + extension, file.name);
                fs.rename(file.path, destinationPath);
                spawn('ln', ['-s', destinationPath, path.join(config.config_dir + file.name)]);
            default:
                break;
            }
        });
        // log any errors that occur
        form.on('error', function(err) {
            app.broadcast('An error has occured: \n' + err, 'ERROR');
        });
        // once all the files have been uploaded, send a response to the client
        form.on('end', function() {
            if(!waitOnConverstion){
                app.broadcast('uploaded ' + fileName, 'SUCCESS');
                res.json({
                    extension: extension, 
                    filename: fileName + '.' + extension,
                    path: destinationPath,
                    status: true
                });
            }
        });
        // parse the incoming request containing the form data
        form.parse(req);
    });

    // Route to create a symbolic link
    app.post('/api/createSymbolicLink', function(req, res){
        var value = req.body.value;
        var extension = value.split('.').pop();
        // if file does not exist
        try {
            // Query the entry
            stats = fs.lstatSync(value);

            // File exists
            if (stats.isFile()) {
                var fileName = value.split('/').pop();
                app.mkdir(upload_dir);
                app.mkdir(path.join(upload_dir, extension));
                var destinationPath = path.join(upload_dir + '/' + extension, fileName);
                var destinationH5Path = path.join(upload_dir + '/h5', fileName.split('.').shift() + '.h5');
                
                // create symbolic link
                var ln = spawn('ln', ['-s', value, destinationPath]);
                ln.stdout.on('data',function(data){
                    app.broadcast(data.toString());
                });
                ln.on('close', function(code){
                    app.broadcast('created symbolic link from ' + value + ' to ' + destinationPath, 'SUCCESS');
                    if(extension !== 'dat'){
                        res.json({status: 'true'});
                    }
                    else{
                        // start convertion when is dat file
                        if(extension === 'dat'){
                            var siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', destinationPath, '-o', destinationH5Path]);
                            siemensToIsmrmd.stdout.on('data',function(data){
                            app.broadcast(data.toString());
                            });
                            siemensToIsmrmd.on('close', function(code){
                            app.broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS');
                            res.json({status: 'true'});
                            });
                            siemensToIsmrmd.stderr.on('data', function(data){
                            app.broadcast(data.toString(),'ERROR');
                            res.json({status: 'false'});
                            });
                        }
                    }
                });
                ln.stderr.on('data', function(data){
                    app.broadcast(data.toString(),'ERROR');
                    res.json({status: 'false'});
                });
            }
            else{
                app.broadcast('selected path: ' + value + ' is not a file', 'ERROR');
                res.json({status: 'false'});
            }
        }
        catch (error) {
            app.broadcast(JSON.stringify(error), 'ERROR');
        }
    });
}