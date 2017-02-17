import Backbone from 'backbone';
import GadgetModel from './../models/gadgetModel';

Backbone.$ = require('jquery');

// Collection for gadgets
var GadgetCollection = Backbone.Collection.extend({
    model: GadgetModel,
    // read gadgets from a configuration(XML)-file
    readFromFile: function(models, callback){
        self = this;
        if(models){
            findGadgets(this, models, 0, function(){
                callback(self);
            });
        }
    },
    // sorts the elements in the collection by name in lowercase
    comparator: function(item){
        if(item.get('name')){
            return item.get('name').toLowerCase();
        }
    }
});

module.exports = GadgetCollection;

// recursiv search over all configuration files
function findGadgets(collection, models, index, callback){
    // if end of models isn't reached
    if(index < models.length){
        // get configuration from model
        if(models.at(index).get('configuration')){
            var configuration = models.at(index).get('configuration').gadgetronStreamConfiguration;
            // if configuration is found
            if(configuration){
                var gadgets = configuration.gadget;
                // if configuration has gadget(s)
                if(gadgets){
                    // search in configuration file for gadgets
                    findGadget(collection, gadgets, 0, function(){
                        index++;
                        // jumps to next configuration file
                        findGadgets(collection, models, index, callback);
                    });
                }
                else{
                    // jumps to next configuration file
                    index++;
                    findGadgets(collection, models, index, callback);
                }
            }
            else{
                // jumps to next configuration file
                index++;
                findGadgets(collection, models, index, callback);
            }
        }
        else{
            // jumps to next configuration file
            index++;
            findGadgets(collection, models, index, callback);
        }
    }
    else{
        // calls callback function
        callback();
    }
}

// find and add gadget to collection
function findGadget(collection, gadgets, index, callback){
    if(index < gadgets.length){
        // create model with properties from file
        var gadgetModel = new GadgetModel({
                            name: gadgets[index].name[0],
                            dll: gadgets[index].dll[0],
                            classname: gadgets[index].classname[0],
                            properties: gadgets[index].property,
                        });
                        collection.add(gadgetModel);
        // jumps to next gadget
        index++;
        findGadget(collection, gadgets, index, callback);
    }
    else{
        // calls callback function
        callback();
    }
}
