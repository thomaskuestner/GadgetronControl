import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
var parseString = require('xml2js').parseString;

// Models
import GadgetronStreamConfiguration from './models/gadgetronStreamConfigurationModel';
import GadgetModel from './models/gadgetModel';
import IoModel from './models/ioModel';

// Collections
import GadgetronStreamConfigurationCollection from './collections/gadgetronStreamConfigurationCollection';
import GadgetCollection from './collections/gadgetCollection';
import IoCollection from './collections/ioCollection';

// Views
import GadgetronStreamConfigurationCollectionView from './views/gadgetronStreamConfiguration/collectionView';

// Extra
import Router from './routes/router.js';
import RegionManager from './regionManager';

Backbone.$ = $;

var gadgetronStreamConfigurationGroup = new GadgetronStreamConfigurationCollection();
var combindedReaders;
var combindedWriters;

// get StreamConfiguration-Files from server
Backbone.ajax({
    url: "/api/gadgetronStreamConfiguration",
    success: function(data){
        parseGadgetronStreamConfigurationXml(data, 0, function(group){
            extractIos(group, 'writer', function(writers){
                combindedWriters = writers;
                extractIos(group, 'reader', function(readers){
                    combindedReaders = readers;
                    extractGadgets(group, function(gadgets){
                        init(group, gadgets, combindedReaders, combindedWriters);
                    });
                });
            });
        })
    }
});

function init(group, gadgets, readers, writers){
    // initalize
    var router = new Router({group, gadgets, readers, writers});
    Backbone.history.start();
}

// extract gadgets from gadgetronStreamConfigurationCollection
function extractGadgets(group, callback){
    Backbone.ajax({
        url: "api/readFromDb",
        data: {
            type: 'gadget'
        },
        success: function(gadgets){
            if(gadgets.length === 0){
                // database empty try to read from files and write to db
                var gadgetGroup = new GadgetCollection();
                gadgetGroup.readFromFile(group, function(gadgets){
                    var gadgetGroupedByName = gadgets.groupBy('name');
                    combineGadgets(gadgetGroupedByName, function(combindedGadgets){    
                        callback(combindedGadgets);                    
                        combindedGadgets.each(function(model, index){
                            model.writeToDb();
                        });
                    });
                });
            }
            else{
                // load collection from database
                var gadgetGroup = new GadgetCollection();
                $.each(gadgets, function(key, value){
                    var gadget = new GadgetModel(value);
                    gadgetGroup.add(gadget);
                });
                callback(gadgetGroup);
            }
        }
    });
}

// extract ios from gadgetronStreamConfigurationCollection
function extractIos(group, type, callback){
    var ioGroup;
    Backbone.ajax({
        url: "api/readFromDb",
        data: {
            type: type
        },
        success: function(ios){
            if(ios.length === 0){
                // database empty try to read from files nad write to db
                ioGroup = new IoCollection();
                ioGroup.readFromFile(group, function(ios){
                    var iosGroupedByClassName = ios.groupBy('classname');
                    combineIos(iosGroupedByClassName, function(combindedIos){
                        callback(combindedIos);
                        combindedIos.each(function(model, index){
                            model.writeToDb(type);
                        });
                    })
                }, type);
            }
            else{
                // load collection from database
                ioGroup = new IoCollection();
                $.each(ios, function(key, value){
                    var io = new IoModel(value);
                    ioGroup.add(io);
                });
                callback(ioGroup);
            }
        }
    });
    return ioGroup;
}

// combine multiple gadgets
function combineGadgets(gadgets, callback){
    var combindedGadgets = new GadgetCollection();
    _.each(gadgets, function(value){
        if(value.length === 1){
            combindedGadgets.add(value[0]);
        }
        else{
            var propertiesMap = new Map();
            _.each(value, function(gadget){
                var properties = gadget.get('properties');
                if(properties){
                    _.each(properties, function(property){
                        propertiesMap.set(property.name[0], property);
                    });
                }
            })
            var properties = new Array();
            for (var [key, property] of propertiesMap) {
                properties.push(property);
            }            
            value[0].set('properties', properties);
            combindedGadgets.add(value[0]);
        }
    })
    callback(combindedGadgets);
}

// combine multiple ios
function combineIos(ios, callback){
    var combindedIos = new IoCollection();
    _.each(ios, function(value){
        combindedIos.add(value[0]);
    })
    callback(combindedIos);
}

// parses gadgetron StreamConfiguration-Files into collection
function parseGadgetronStreamConfigurationXml(data, index, callback){
    if(index < data.length){
        parseString(data[index].content, function(error, result){
            var gadgetronStreamConfiguration = new GadgetronStreamConfiguration({name: data[index].configurationName, configuration: result});
            gadgetronStreamConfigurationGroup.add(gadgetronStreamConfiguration);
        });
        index++;
        parseGadgetronStreamConfigurationXml(data, index, callback);
    }
    else{
        callback(gadgetronStreamConfigurationGroup);
    }
}