import Backbone from 'backbone';
import IoModel from './../models/ioModel';

Backbone.$ = require('jquery');
var type;

// Collection for reader and writer
var IoCollection = Backbone.Collection.extend({
    model: IoModel,
    // read readers/writers from a configuration(XML)-file
    readFromFile: function(models, callback, attributes){
        type = attributes;
        self = this;
        if(models){
            findIos(this, models, 0, function(){
                callback(self);
            });
        }
    },
    // sorts the elements in the collection by name in lowercase
    comparator: function(item){
        if(item.get('classname')){
            return item.get('classname').toLowerCase();
        }
    }
});

module.exports = IoCollection;

// recursiv search over all configuration files
function findIos(collection, models, index, callback){
    // if end of models isn't reached
    if(index < models.length){
        // get configuration from model
        if(models.at(index).get('configuration')){
            var configuration = models.at(index).get('configuration').gadgetronStreamConfiguration;
            // if configuration is found
            if(configuration){
                // get either reader or writer depending on type variable
                var ios = configuration[type];
                // if reader/writer found
                if(ios){
                    // search in configuration file for reader/writer
                    findIo(collection, ios, 0, function(){
                        // jumps to next reader/writer
                        index++;
                        findIos(collection, models, index, callback);
                    });
                }
                else{
                    // jumps to next reader/writer
                    index++;
                    findIos(collection, models, index, callback);
                }
            }
            else{
                // jumps to next reader/writer
                index++;
                findIos(collection, models, index, callback);
            }
        }
        else{
            // jumps to next reader/writer
            index++;
            findIos(collection, models, index, callback);
        }
    }
    else{
        // calls callback function
        callback();
    }
}

// find and add reader/writer to theris collection
function findIo(collection, ios, index, callback){
    if(index < ios.length){
        // create model with properties from file
        var ioModel = new IoModel({
                            slot: ios[index].slot[0],
                            dll: ios[index].dll[0],
                            classname: ios[index].classname[0]
                        });
                        collection.add(ioModel);
        // jumps to next reader/writer
        index++;
        findIo(collection, ios, index, callback);
    }
    else{
        // calls callback function
        callback();
    }
}
