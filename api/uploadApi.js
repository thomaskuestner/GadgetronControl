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
                            status: 'SUCCESS',
                            data: {
                                h5 :{
                                    extension: extension, 
                                    name: fileName + '.h5',
                                    path: destinationH5Path
                                },
                                dat:{
                                    extension: extension, 
                                    name: fileName + '.' + extension,
                                    path: destinationPath
                                }
                            }
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
                    destinationPath = path.join(path.dirname(require.main.filename) + '/' + config.upload_dir + '/' + extension, file.name);
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
                var data;
                switch(extension){
                    case 'dat':
                        data = 
                        {
                            dat: {
                                extension: extension, 
                                name: fileName + '.' + extension,
                                path: destinationPath
                            }
                        };
                        break;
                    case 'h5':
                        data = 
                        {
                            h5: {
                                extension: extension, 
                                name: fileName + '.' + extension,
                                path: destinationPath
                            }
                        };
                        break;
                    case 'xml':
                        data = 
                        {
                            xml: {
                                extension: extension, 
                                name: fileName + '.' + extension,
                                path: destinationPath
                            }
                        };
                        break;
                    case 'xsl':
                        data = 
                        {
                            xsl: {
                                extension: extension, 
                                name: fileName + '.' + extension,
                                path: destinationPath
                            }
                        };
                        break;
                }
                app.broadcast('uploaded ' + fileName, 'SUCCESS');
                res.json({
                    status: 'SUCCESS',
                    data: data
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
                app.mkdir(config.upload_dir);
                app.mkdir(path.join(config.upload_dir, extension));
                var destinationPath = path.join(config.upload_dir + '/' + extension, fileName);
                var destinationH5Path = path.join(config.upload_dir + '/h5', fileName.split('.').shift() + '.h5');
                
                // create symbolic link
                var ln = spawn('ln', ['-s', value, destinationPath]);
                ln.stdout.on('data',function(data){
                    app.broadcast(data.toString());
                });
                ln.on('close', function(code){
                    app.broadcast('created symbolic link from ' + value + ' to ' + destinationPath, 'SUCCESS');
                    if(extension !== 'dat'){
                        switch(extension){
                            case 'h5':
                                data = 
                                {
                                    h5: {
                                        extension: extension, 
                                        name: fileName + '.' + extension,
                                        path: destinationPath
                                    }
                                };
                                break;
                            case 'xml':
                                data = 
                                {
                                    xml: {
                                        extension: extension, 
                                        name: fileName + '.' + extension,
                                        path: destinationPath
                                    }
                                };
                                break;
                            case 'xsl':
                                data = 
                                {
                                    xsl: {
                                        extension: extension, 
                                        name: fileName + '.' + extension,
                                        path: destinationPath
                                    }
                                };
                                break;
                        }
                        if(!res.headersSent){
                            res.json({
                                status: 'SUCCESS',
                                data: data
                            });
                        }
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
                                if(!res.headersSent){
                                    res.json({
                                        status: 'SUCCESS',
                                        data: {
                                            h5 :{
                                                extension: extension, 
                                                name: fileName + '.h5',
                                                path: destinationH5Path
                                            },
                                            dat:{
                                                extension: extension, 
                                                name: fileName + '.' + extension,
                                                path: destinationPath
                                            }
                                        }
                                    });
                                }
                            });
                            siemensToIsmrmd.stderr.on('data', function(data){
                                app.broadcast(data.toString(),'ERROR');
                                if(!res.headersSent){
                                    res.json({
                                        status: 'ERROR'
                                    });
                                }
                            });
                        }
                    }
                });
                ln.stderr.on('data', function(data){
                    app.broadcast(data.toString(),'ERROR');
                    if(!res.headersSent){
                        res.json({
                            status: 'ERROR'
                        });
                    }
                });
            }
            else{
                app.broadcast('selected path: ' + value + ' is not a file', 'ERROR');
                if(!res.headersSent){
                    res.json({
                        status: 'ERROR'
                    });
                }
            }
        }
        catch (error) {
            app.broadcast(error.toString(), 'ERROR');
            if(!res.headersSent){
                res.json({
                    status: 'ERROR'
                });
            }
        }
    });
}