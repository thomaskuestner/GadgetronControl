var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var path = require('path');

// API for gadgetronIsmrmrdClient
module.exports = function(app, config, autoconfig){
    // route for starting gadgetronIsmrmrdClient
    // needs at minimum filename
    app.get('/api/gadgetronIsmrmrdClient/start', function(req, res) {
        var configurationPath = req.query.configurationPath;
        var dataPath = req.query.dataPath;
        if(dataPath){
            var extension = dataPath.split('.').pop();
            var fileName = dataPath.split('/').pop();
            var xslPath = req.query.xslPath;
            var dateNow = new Date();
            var timeStamp = dateNow.getFullYear() + '_' + (dateNow.getMonth() + 1) + '_' + dateNow.getDate() + '_' + dateNow.getHours() + '_' + dateNow.getMinutes() + '_' + dateNow.getSeconds();
            mkdirp(config.result_dir);
            var resultFileName = req.query.resultFileName || timeStamp + '_' + fileName;
            var errorFlag = false;
            if(resultFileName.split('.').pop() !== 'h5'){
                resultFileName = resultFileName +  '.h5';
            }
            var resultPath = path.join(config.result_dir, resultFileName);
            console.log(resultPath);
            // convert to h5 if it is dat
            if(extension === 'dat'){
                var destinationH5Path = path.join(config.upload_dir + '/h5', fileName.split('.').shift() + '.h5');
                var siemensToIsmrmd;
                if(xslPath){
                    siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', dataPath, '--user-stylesheet', xslPath, '-o', destinationH5Path]); 
                }
                else{
                    siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', dataPath, '-o', destinationH5Path]); 
                }
                siemensToIsmrmd.stdout.on('data',function(data){
                    app.broadcast(data.toString(),null, 'siemens_to_ismrmrd');
                });
                siemensToIsmrmd.on('close', function(code){
                    if(typeof app.autoconfig.gadgetron_port !== 'undefined'){
                        app.broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS', 'siemens_to_ismrmrd');
                        dataPath = destinationH5Path;
                        var gadgetronIsmrmrdClient = spawn('gadgetron_ismrmrd_client',['-f', dataPath, '-c', configurationPath, '-o', resultPath, '-p', app.autoconfig.gadgetron_port]);
                        gadgetronIsmrmrdClient.stdout.on('data', function(data){
                            app.broadcast(data.toString(), null, 'gadgetron_ismrmrd_client');
                        });
                        gadgetronIsmrmrdClient.on('close', function(code){
                            if(errorFlag){
                                app.broadcast('data ' + dataPath + ' was proceeded with ' + configurationPath + ' to ' + resultPath, 'SUCCESS', 'gadgetron_ismrmrd_client');
                                if(!res.headersSent){
                                    res.json({
                                        data:{
                                                extension: 'h5', 
                                                filename: resultFileName,
                                                path: resultPath
                                            },
                                        status: 'SUCCESS'
                                    });
                                }
                            }
                        }, this);
                        gadgetronIsmrmrdClient.stderr.on('data', function(data){
                            errorFlag = true;
                            app.broadcast(data.toString(),'ERROR', 'gadgetron_ismrmrd_client');
                            if(!res.headersSent){
                                res.json({status: 'false'});
                            }
                        }, this);
                    }
                    else{
                        app.broadcast('Gadgetron-Port is not set', 'ERROR', 'GadgetronControl');
                        if(!res.headersSent){
                            res.json({
                                status: 'ERROR'
                            });
                        }
                    }
                });
                siemensToIsmrmd.stderr.on('data', function(data){
                    app.broadcast(data.toString(),'ERROR', 'gadgetron_ismrmrd_client');
                });
            }
            else if(extension === "h5"){
                if(typeof app.autoconfig.gadgetron_port !== 'undefined'){
                    var gadgetronIsmrmrdClient = spawn('gadgetron_ismrmrd_client',['-f', dataPath, '-c', configurationPath, '-o', resultPath, '-p', app.autoconfig.gadgetron_port]);
                    gadgetronIsmrmrdClient.stdout.on('data', function(data){
                        app.broadcast(data.toString(), null, 'gadgetron_ismrmrd_client');
                        if(data.toString().toLowerCase().indexOf('error') === -1){
                            errorFlag = true;
                            if(!res.headersSent){
                                res.json({status: 'false'});
                            }
                        }
                    });
                    gadgetronIsmrmrdClient.on('close', function(code){
                        if(!errorFlag){
                            app.broadcast('data ' + dataPath + ' was proceeded with ' + configurationPath + ' to ' + resultPath, 'SUCCESS', 'gadgetron_ismrmrd_client');
                            if(!res.headersSent){
                                res.json({
                                    data:{
                                            extension: 'h5', 
                                            filename: resultFileName,
                                            path: resultPath
                                        },
                                    status: 'SUCCESS'
                                });
                            }
                        }
                    }, this);
                    gadgetronIsmrmrdClient.stderr.on('data', function(data){
                        errorFlag = true;
                        app.broadcast(data.toString(),'ERROR', 'gadgetron_ismrmrd_client');
                        if(!res.headersSent){
                            res.json({status: 'false'});
                        }
                    }, this);
                }        
                else{
                    app.broadcast('Gadgetron-Port is not set', 'ERROR', 'GadgetronControl');
                    if(!res.headersSent){
                        res.json({
                            status: 'ERROR'
                        });
                    }
                }
            }
        }
        else{
            var extension = configurationPath.split('.').pop();
            var fullPath = path.join(config.upload_dir,extension,configurationPath);
            if(extension === 'py'){
                startScript('python', fullPath, res);
            }
            else if(extension === 'sh'){
                startScript('bash', fullPath, res);
            }
            else{
                app.broadcast('No datapath is set', 'ERROR', 'GadgetronControl');
                if(!res.headersSent){
                    res.json({
                        status: 'ERROR'
                    });
                }
            }
        }
    });

    function startScript(program, script, res){
        var bash = spawn(program,[script]);
        bash.stdout.on('data', function(data){
            app.broadcast(data.toString(), null, 'GadgetronControl');
        });
        bash.on('close', function(code){
            app.broadcast('script ' + script + ' was proceeded', 'SUCCESS', 'GadgetronControl');
            if(!res.headersSent){
                res.json({
                    status: 'SUCCESS'
                });
            }
        }, this);
        bash.stderr.on('data', function(data){
            app.broadcast(data.toString(),'ERROR', 'GadgetronControl');
            if(!res.headersSent){
                res.json({
                    status: 'ERROR'
                });
            }
        }, this);
    }
}