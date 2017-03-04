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
require('./api/gadgetronControlApi')(app);

// start hdfview on server
app.get('/api/startHdfView', function(req, res) {
    var filePath = req.query.filePath;
    var success = true;
    var hdfViewer = spawn('hdfview',[filePath]);
    hdfViewer.stdout.on('data', function(data){
        if(data){
            app.broadcast(data.toString(), null, 'hdfview');
        }
    });
    hdfViewer.on('close', function(code){
        if(success){
            app.broadcast('hdfview opened ' + filePath, 'SUCCESS', 'hdfview');
        }
        if(!res.headersSent){
            res.json({status: 'true'});
        }
    });
    hdfViewer.stderr.on('data', function(data){
        success = false;
        app.broadcast(data.toString(),'ERROR', 'hdfview');
        if(!res.headersSent){
            res.json({status: 'false'});
        }
    });
    hdfViewer.on('error', function(error){
        app.broadcast('probabply hdfview is not installed', 'ERROR', 'hdfview');
    })
});

app.server.listen(config.port);

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
