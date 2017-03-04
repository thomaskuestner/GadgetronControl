var Datastore = require('nedb');

// API for database
module.exports = function(app, config){
    // Create and Load Database
    var gadgetsDb = new Datastore({ filename: config.gadgets_db, autoload: true });
    // Using a unique constraint with the index
    gadgetsDb.ensureIndex({ fieldName: 'name', unique: true });
    var readersDb = new Datastore({ filename: config.readers_db, autoload: true });
    // Using a unique constraint with the index
    readersDb.ensureIndex({ fieldName: 'classname', unique: true });
    var writersDb = new Datastore({ filename: config.writers_db, autoload: true });
    // Using a unique constraint with the index
    writersDb.ensureIndex({ fieldName: 'classname', unique: true });

    // route for writing something in the database
    app.post('/api/writeInDb', function(req, res){
        var type = req.body.type;
        var content = req.body.content;
        var database;
        var name;
        switch (type) {
            case 'gadget':      
                database = gadgetsDb;
                name = req.body.content.name;
                break;
            case 'reader':
                database = readersDb;
                name = req.body.content.classname;
                break;  
            case 'writer':
                database = writersDb;
                name = req.body.content.classname;
                break;  
            default:
                res.json({status: false});
                break;
        }
        if(database){
            database.insert(content, function(error, entry){
            if(error){
                app.broadcast(JSON.stringify(error), 'ERROR', 'GadgetronControl');
                res.json({status: false});
            }
            else{
                app.broadcast('write ' + type + ': ' + name + ' in Database','SUCCESS', 'GadgetronControl');
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
                app.broadcast(JSON.stringify(error), 'ERROR', 'GadgetronControl');
                res.json({status: false});
            }
            else{
                app.broadcast('updated ' + type + ' in Database','SUCCESS', 'GadgetronControl');
                res.json({status: true});
            }
            });
        }
    });

    // route for removing something in the database
    app.delete('/api/removeFromDb', app.requireRole('admin'), function(req, res){
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
                app.broadcast(JSON.stringify(error), 'ERROR', 'GadgetronControl');
                res.json({status: false});
            }
            else{
                app.broadcast('remove ' + type + ' in Database','SUCCESS', 'GadgetronControl');
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
}