var express = require('express');
var WebSocketServer = require('ws').Server;
var http = require('http');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var browserify = require('browserify-middleware');
var babelify = require('express-babelify-middleware');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var mv = require('mv');
var mkdirp = require('mkdirp');
var Datastore = require('nedb');
var ps = require('ps-node');
var tail = require('tail').Tail;

var iFrequency = 500; // expressed in miliseconds
var myInterval = 0;

var app = express();
app.server = http.createServer(app);

app.use(bodyParser.urlencoded({
  extended: true
}));

// load parameter
var config = require('./config.json');
var config_dir = config.config_dir;
var upload_dir = config.upload_dir;
var adminUser = config.adminUser;
var password = config.password;

var configurationList = new Array;

// Web-WebSockets
// WebSocket for logging
var wss = new WebSocketServer({ server: app.server , path: '/logbroadcast'});
function broadcast(data, loglevel) {
  // parse message for loglevel case insensative (-i) when loglevel isn't set
  if(typeof loglevel === 'undefined'){
    var debug = new RegExp('DEBUG', 'i');
    var error = new RegExp('ERROR', 'i');
    if(data.match(debug)){
      loglevel = 'DEBUG';
    }
    else if(data.match(error)){
      loglevel = 'ERROR';
    }
    else{
      loglevel = 'INFO';
    }
  }
  wss.clients.forEach(function each(client) {
    var msg = JSON.stringify({data: data, loglevel: loglevel});
    client.send(JSON.stringify({data: data, loglevel: loglevel}));
  });
};

// WebSocket for gadgetron state
var wssGadgetronStatus = new WebSocketServer({ server: app.server , path: '/gadgetronstate'});
function broadcastGadgetronStatus(data) {
  wssGadgetronStatus.clients.forEach(function each(client) {
    client.send(JSON.stringify(data));
  });
};

// send gagetronState every 500ms
function sendGadgertonState() {
    if(myInterval > 0) {
      clearInterval(myInterval);
    }  // stop
    myInterval = setInterval( function(){
      ps.lookup({
          command: 'gadgetron',
          }, function(err, resultList ) {
          if (err) {
              throw new Error( err );
          }
          resultList.forEach(function( process ){
              if( process ){  
                broadcastGadgetronStatus({processId: process.pid, processCommand: process.command, processArgument: process.arguments, state: 'on' });
              }
              else{

              }
          });
          if(resultList.length === 0){
                broadcastGadgetronStatus({processId: 0, processCommand: '', processArgument: '' , state: 'off' });
          }
      });  
    }, iFrequency );  // run
}
sendGadgertonState();

// watch gadgetron log file
tail = new tail(config.gadgetron_log);

tail.on("line", function(data) {
  broadcast(data);
});

// Create and Load Database
var gadgetsDb = new Datastore({ filename: config.gadgets_db, autoload: true });
// Using a unique constraint with the index
gadgetsDb.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
});
var readersDb = new Datastore({ filename: config.readers_db, autoload: true });
// Using a unique constraint with the index
readersDb.ensureIndex({ fieldName: 'classname', unique: true }, function (err) {
});
var writersDb = new Datastore({ filename: config.writers_db, autoload: true });
// Using a unique constraint with the index
writersDb.ensureIndex({ fieldName: 'classname', unique: true }, function (err) {
});

// browserify
app.get('/js/gadgetronBundleApp.js', babelify('./public/js/main.js', {debug: true}));

// authentification
app.use(cookieParser());
app.use(session({
  secret: '1234567890QWERTY',
  resave: true,
  saveUninitialized: true
}));

function requireRole(role) {
    return function(req, res, next) {
        if(req.session.role === role && req.session.isLoggedIn)
            next();
        else
            res.sendStatus(403);
    }
}

// defines routes
// access to public folder
app.use(express.static('public'));

// check for changes in config_dir
fs.watch(config_dir, function(event, filename){
  configurationList = new Array;
});

// route for getting StreamConfiguration-Files
// only read directory at first access and if filewatcher detacted changes
app.get('/api/gadgetronStreamConfiguration', function(req, res) {
  if(configurationList.length > 0){
    res.json(configurationList);
  }
  else{
    readConfigurationDir(config_dir, configurationList, function(){
      res.json(configurationList);
    });
  }
});

// route for saving configuration file
app.post('/api/gadgetronStreamConfiguration', function(req, res) {
  var savePath = config_dir + req.body.fileName;
  fs.writeFileSync(savePath, req.body.content);
  broadcast('saved ' + savePath, 'SUCCESS');
  res.json({status: 'saved'});
});

// route for getting content of a folder
app.get('/api/getFolder', function(req, res){
  var path = req.query.folderPath;
  mkdirp(path, function(error){
    if(error){
      broadcast(error);
      res.json(error);
    }
    else{
      fs.readdir(path, function(error, files) {
        res.json(files);
      });
    }
  })
});

// route for moving file to trash
app.post('/api/fileToTrash', requireRole('admin'), function(req, res){
  var fileName = req.body.fileName;
  var trashFileName = path.join(config.trash_dir, fileName);
  mv(fileName, trashFileName, {mkdirp: true}, function(error){
    if(error){
      broadcast(JSON.stringify(error), 'ERROR');
      res.json({status: false});
    }
    else{
      broadcast('moved ' + fileName + ' to trash', 'SUCCESS');
      res.json({status: true});
    }
  })
});

// route for deleting file
app.delete('/api/fileToTrash', requireRole('admin'), function(req, res){
  var fileName = req.body.fileName;
  fs.unlink(fileName, function(error, stats){
    if(error){
      broadcast(JSON.stringify(error),'ERROR');
      console.log(error);
      res.json({status: false});
    }
    else{
      broadcast('deleted ' +  fileName, 'SUCCESS');
      res.json({status: true});
    }
  });
});

// route for writing something in the database
app.post('/api/writeInDb', function(req, res){
  var type = req.body.type;
  var content = req.body.content;
  var database;
  switch (type) {
    case 'gadget':      
      database = gadgetsDb;
      break;
    case 'reader':
      database = readersDb;
      break;  
    case 'writer':
      database = writersDb;
      break;  
    default:
      res.json({status: false});
      break;
  }

  if(database){
    database.insert(content, function(error, entry){
      if(error){
        broadcast(JSON.stringify(error), 'ERROR');
        res.json({status: false});
      }
      else{
        broadcast('write ' + type + ' in Database','SUCCESS');
        res.json({status: true, _id: type._id});
      }
    });
  }
});

// route for updating something in the database
app.put('/api/updateDb', function(req, res){
  var type = req.body.type;
  var content = req.body.content;
  var database;
  switch (type) {
    case 'gadget':      
      database = gadgetsDb;
      break;
    case 'reader':
      database = readersDb;
      break;  
    case 'writer':
      database = writersDb;
      break;  
    default:
      res.json({status: false});
      break;
  }

  if(database){
    database.update({ _id: content._id}, content, function(error){
      if(error){
        broadcast(JSON.stringify(error), 'ERROR');
        res.json({status: false});
      }
      else{
        broadcast('updated ' + type + ' in Database','SUCCESS');
        res.json({status: true});
      }
    });
  }
});

// route for removing something in the database
app.delete('/api/removeFromDb', requireRole('admin'), function(req, res){
  var type = req.body.type;
  var content = req.body.content;  
  var database;
  switch (type) {
    case 'gadget':      
      database = gadgetsDb;
      break;
    case 'reader':
      database = readersDb;
      break;  
    case 'writer':
      database = writersDb;
      break;  
    default:
      res.json({status: false});
      break;
  }

  if(database){
    database.remove({ _id: content._id}, {}, function(error){
      if(error){
        broadcast(JSON.stringify(error), 'ERROR');
        res.json({status: false});
      }
      else{
        broadcast('remove ' + type + ' in Database','SUCCESS');
        res.json({status: true});
      }
    });
  }
});

// read from databases
app.get('/api/readFromDb', function(req, res){
  var type = req.query.type;
  switch (type) {
    case 'gadget':
      gadgetsDb.find({},function(error, gadgets){
        res.json(gadgets);
      });
      break;      
    case 'reader':
      readersDb.find({},function(error, readers){
        res.json(readers);
      });
      break;
    case 'writer':
      writersDb.find({},function(error, writers){
        res.json(writers);
      });
      break;  
    default:
      res.json({status: false});
      break;
  }
});

// get user
app.get('/api/user', function(req, res){
  if(typeof req.session.role === 'undefined'){
    req.session.role = 'user';
  }
  if(typeof req.session.isLoggedIn === 'undefined'){
    req.session.isLoggedIn = false;
  }
  res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
});

// admin login
app.post('/api/login', function(req, res){
  if(req.body.name === adminUser && req.body.password === password){
    req.session.role = 'admin';
    req.session.isLoggedIn = true;
  }
  else{
    req.session.role = 'user';
    req.session.isLoggedIn = false;
  }
  broadcast('admin is logged','SUCCESS');
  res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
});

// admin logout
app.post('/api/logout', function(req, res){
  req.session.role = 'user';
  req.session.isLoggedIn = false;  
  broadcast('admin is logged out','SUCCESS');
  res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
});

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
  mkdir(upload_dir);
  form.uploadDir = upload_dir;
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    extension = file.name.split('.').pop();
    fileName = file.name.split('.').shift();
    mkdir(path.join(form.uploadDir, extension));;
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
          broadcast(data.toString());
        });
        siemensToIsmrmd.on('close', function(code){
          broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS');
          broadcast('uploaded ' + fileName, 'SUCCESS');
          res.json({
            extension: extension, 
            filename: fileName + '.' + extension,
            path: destinationPath,
            status: true
          });
        });
        siemensToIsmrmd.stderr.on('data', function(data){
          broadcast(data.toString());
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
        spawn('ln', ['-s', destinationPath, path.join(config_dir + file.name)]);
      default:
        break;
    }
  });
  // log any errors that occur
  form.on('error', function(err) {
    broadcast('An error has occured: \n' + err, 'ERROR');
  });
  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    if(!waitOnConverstion){
      broadcast('uploaded ' + fileName, 'SUCCESS');
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
        mkdir(upload_dir);
        mkdir(path.join(upload_dir, extension));
        var destinationPath = path.join(upload_dir + '/' + extension, fileName);
        var destinationH5Path = path.join(upload_dir + '/h5', fileName.split('.').shift() + '.h5');
        
        // create symbolic link
        var ln = spawn('ln', ['-s', value, destinationPath]);
        ln.stdout.on('data',function(data){
          broadcast(data.toString());
        });
        ln.on('close', function(code){
          broadcast('created symbolic link from ' + value + ' to ' + destinationPath, 'SUCCESS');
          if(extension !== 'dat'){
            res.json({status: 'true'});
          }
          else{
            // start convertion when is dat file
            if(extension === 'dat'){
                var siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', destinationPath, '-o', destinationH5Path]);
                siemensToIsmrmd.stdout.on('data',function(data){
                  broadcast(data.toString());
                });
                siemensToIsmrmd.on('close', function(code){
                  broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS');
                  res.json({status: 'true'});
                });
                siemensToIsmrmd.stderr.on('data', function(data){
                  broadcast(data.toString(),'ERROR');
                  res.json({status: 'false'});
                });
            }
          }
        });
        ln.stderr.on('data', function(data){
          broadcast(data.toString(),'ERROR');
          res.json({status: 'false'});
        });
      }
      else{
        broadcast('selected path: ' + value + ' is not a file', 'ERROR');
        res.json({status: 'false'});
      }
    }
    catch (error) {
      broadcast(JSON.stringify(error), 'ERROR');
    }
});

// route for starting gadgetronIsmrmrdClient
// needs at minimum filename
app.get('/api/gadgetronIsmrmrdClient/start', function(req, res) {
  var configurationPath = req.query.configurationPath;
  var dataPath = req.query.dataPath;
  var extension = dataPath.split('.').pop();
  var fileName = dataPath.split('/').pop();
  var xslPath = req.query.xslPath;
  var dateNow = new Date();
  var timeStamp = dateNow.getFullYear() + '_' + (dateNow.getMonth() + 1) + '_' + dateNow.getDate() + '_' + dateNow.getHours() + '_' + dateNow.getMinutes() + '_' + dateNow.getSeconds();
  mkdirp(config.result_dir);
  var resultFileName = req.query.resultFileName || timeStamp + '_' + fileName;
  if(resultFileName.split('.').pop() !== 'h5'){
    resultFileName = resultFileName +  '.h5';
  }
  var resultPath = path.join(config.result_dir, resultFileName);
  console.log(resultPath);
  // convert to h5 if it is dat
  if(extension === 'dat'){
    var destinationH5Path = path.join(upload_dir + '/h5', fileName.split('.').shift() + '.h5');
    var siemensToIsmrmd;
    if(xslPath){
      console.log('xslPath: ' + xslPath);
      siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', dataPath, '--user-stylesheet', xslPath, '-o', destinationH5Path]); 
    }
    else{
      siemensToIsmrmd = spawn('siemens_to_ismrmrd',['-f', dataPath, '-o', destinationH5Path]); 
    }
    siemensToIsmrmd.stdout.on('data',function(data){
      broadcast(data.toString());
    });
    siemensToIsmrmd.on('close', function(code){
      broadcast('converted ' + fileName + ' to h5-format', 'SUCCESS');
      dataPath = destinationH5Path;
      var gadgetronIsmrmrdClient = spawn('gadgetron_ismrmrd_client',['-f', dataPath, '-c', configurationPath, '-o', resultPath, '-p', config.gadgetron_port]);
      gadgetronIsmrmrdClient.stdout.on('data', function(data){
        broadcast(data.toString());
      });
      gadgetronIsmrmrdClient.on('close', function(code){
        broadcast('data ' + dataPath + ' was proceeded with ' + configurationPath + ' to ' + resultPath, 'SUCCESS');
        if(!res.headersSent){
          res.json({status: 'true'});
        }
      });
      gadgetronIsmrmrdClient.stderr.on('data', function(data){
        broadcast(data.toString(),'ERROR');
        if(!res.headersSent){
         res.json({status: 'false'});
        }
      });
    });
    siemensToIsmrmd.stderr.on('data', function(data){
      broadcast(data.toString(),'ERROR');
    });
  }
  else{
    var gadgetronIsmrmrdClient = spawn('gadgetron_ismrmrd_client',['-f', dataPath, '-c', configurationPath, '-o', resultPath, '-p', config.gadgetron_port]);
    gadgetronIsmrmrdClient.stdout.on('data', function(data){
      broadcast(data.toString());
    });
    gadgetronIsmrmrdClient.on('close', function(code){
      broadcast('data ' + dataPath + ' was proceeded with ' + configurationPath + ' to ' + resultPath, 'SUCCESS');
      if(!res.headersSent){
        res.json({status: 'true'});
      }
    });
    gadgetronIsmrmrdClient.stderr.on('data', function(data){
      broadcast(data.toString(),'ERROR');
      if(!res.headersSent){
        res.json({status: 'false'});
      }
    });
  }
});

// start hdfview on server
app.get('/api/startHdfView', function(req, res) {
    var filePath = req.query.filePath;
    var success = true;
    var hdfViewer = spawn('hdfview',[filePath]);
    hdfViewer.stdout.on('data', function(data){
      if(data){
        broadcast(data.toString());
      }
    });
    hdfViewer.on('close', function(code){
      if(success){
        broadcast('hdfview opened ' + filePath, 'SUCCESS');
      }
      if(!res.headersSent){
        res.json({status: 'true'});
      }
    });
    hdfViewer.stderr.on('data', function(data){
      success = false;
      broadcast(data.toString(),'ERROR');
      if(!res.headersSent){
        res.json({status: 'false'});
      }
    });
    hdfViewer.on('error', function(error){
      broadcast('probabply hdfview is not installed', 'ERROR');
    })
});

app.server.listen(config.port);

// methods
// iterate recursivly over all files in config_dir
function readConfigurationDir(config_dir, configurationList, callback){
  fs.readdir(config_dir, function(error, files) {
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
function readConfigurationFileContent(file, configurationList, callback){
  fs.readFile(config_dir + file, 'utf8', function(error, content){
    if (error) {
        throw error;
    }
    configurationList.push({configurationName: file, content: content.trim()});
    callback();
  });
}

// create folder
function mkdir(pathDir){
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
