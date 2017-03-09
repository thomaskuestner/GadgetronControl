var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');

var app = express();
app.server = http.createServer(app);

// load parameter
var config = require('./config.json');
app.autoconfig = {};

// load error handling
require('./errorHandling')(config);

app.use(bodyParser.urlencoded({
    extended: true
}));

// initiate websockets
require('./websocket')(app);

// load gadgetron stuff
require('./gadgetron')(app, config);

// load User API
require('./api/userApi')(app, config);

// defines routes
// access to public folder
app.use(express.static('public'));

// load gadgetronStreamConfiguration API
require('./api/gadgetronStreamConfigurationApi')(app, config);

// load getFolder API
require('./api/getFolderApi')(app);

// load fileToTrash API
require('./api/fileToTrashApi')(app, config);

// load database API
require('./api/databaseApi')(app, config);

// load upload API
require('./api/uploadApi')(app, config);

// load gadgetronIsmrmrdClient API
require('./api/gadgetronIsmrmrdClientApi')(app, config);

// load Configuration API
require('./api/configurationApi')(app);

// load GadgetronControl API
require('./api/gadgetronControlApi')(app, config);

// load Electron API
require('./api/electronApi')(app);

// start viewer on server
app.get('/api/startViewer', function(req, res) {
    var filePath = req.query.filePath;
    var success = true;
    var viewer = spawn(config.viewer,[filePath]);
    viewer.stdout.on('data', function(data){
        if(data){
            app.broadcast(data.toString(), null, config.viewer);
        }
    });
    viewer.on('close', function(code){
        if(success){
            app.broadcast(config.viewer + ' opened ' + filePath, 'SUCCESS', config.viewer);
        }
        if(!res.headersSent){
            res.json({status: 'true'});
        }
    });
    viewer.stderr.on('data', function(data){
        success = false;
        app.broadcast(data.toString(),'ERROR', config.viewer);
        if(!res.headersSent){
            res.json({status: 'false'});
        }
    });
    viewer.on('error', function(error){
        success = false;
        app.broadcast('probabply ' + config.viewer + ' is not installed', 'ERROR', config.viewer);
    });
});

app.server.listen(config.port);

// start gadgetron
app.restartGadgetron();

// methods
// create folder
app.mkdir = function mkdir(pathDir){
    try{
    pathDir.split('/').forEach(function(dir, index, splits){
        const parent = splits.slice(0, index).join('/');
        const dirPath = path.resolve(parent, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    });
    }
    catch(exception){
        if(exception.code != 'EEXIST'){
            throw exception;
        }
    }
}
