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

var gadgetronStreamConfigurationGroup = new GadgetronStreamConfigurationCollection();

var gadgetron = {
    // extract gadgets from gadgetronStreamConfigurationCollection
    extractGadgets: function extractGadgets(group, callback){
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
                        gadgetron.combineGadgets(gadgetGroupedByName, function(combindedGadgets){    
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
    },

    // upgrade gadgets from gadgetronStreamConfigurationCollection
    upgradeGadgets: function upgradeGadgets(group, gadgetGroup){
        Backbone.ajax({
            url: "api/readFromDb",
            data: {
                type: 'gadget'
            },
            success: function(gadgetsDatabase){
                var gadgetNewGroup = new GadgetCollection();
                gadgetNewGroup.readFromFile(group, function(gadgetFile){
                    var gadgetGroupedByName = gadgetFile.groupBy('name');
                    gadgetron.combineIos(gadgetGroupedByName, function(fileGadgets){
                        fileGadgets.forEach(function(gadget){
                            var found = false;
                            for(var index in gadgetsDatabase){
                                if(gadgetsDatabase[index]['classname'] === gadget.get('classname')){
                                    found = true;
                                }
                            }
                            if(!found){
                                gadgetGroup.add(gadget);
                                gadget.writeToDb();
                            }
                        });
                    })
                });
            }
        });
    },

    // extract ios from gadgetronStreamConfigurationCollection
    extractIos: function extractIos(group, type, callback){
        var ioGroup;
        Backbone.ajax({
            url: "api/readFromDb",
            data: {
                type: type
            },
            success: function(ios){
                if(ios.length === 0){
                    // database empty try to read from files and write to db
                    ioGroup = new IoCollection();
                    ioGroup.readFromFile(group, function(ios){
                        var iosGroupedByClassName = ios.groupBy('classname');
                        gadgetron.combineIos(iosGroupedByClassName, function(combindedIos){
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
    },

    // upgrade ios from gadgetronStreamConfigurationCollection
    upgradeIos: function upgradeIos(group, ioGroup, type){
        Backbone.ajax({
            url: "api/readFromDb",
            data: {
                type: type
            },
            success: function(iosDatabase){
                var ioNewGroup = new IoCollection();
                ioNewGroup.readFromFile(group, function(iosFile){
                    var iosGroupedByClassName = iosFile.groupBy('classname');
                    gadgetron.combineIos(iosGroupedByClassName, function(fileIos){
                        fileIos.forEach(function(io){
                            var found = false;
                            for(var index in iosDatabase){
                                if(iosDatabase[index]['classname'] === io.get('classname')){
                                    found = true;
                                }
                            }
                            if(!found){
                                ioGroup.add(io);
                                io.writeToDb(type);
                            }
                        });
                    })
                }, type);
            }
        });
    },

    // combine multiple gadgets
    combineGadgets: function combineGadgets(gadgets, callback){
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
    },

    // combine multiple ios
    combineIos: function combineIos(ios, callback){
        var combindedIos = new IoCollection();
        _.each(ios, function(value){
            combindedIos.add(value[0]);
        })
        callback(combindedIos);
    },

    // parses gadgetron StreamConfiguration-Files into collection
    parseGadgetronStreamConfigurationXml: function parseGadgetronStreamConfigurationXml(data, index, callback){
        if(index < data.length){
            parseString(data[index].content, function(error, result){
                var gadgetronStreamConfiguration = new GadgetronStreamConfiguration({name: data[index].configurationName, configuration: result});
                gadgetronStreamConfigurationGroup.add(gadgetronStreamConfiguration);
            });
            index++;
            gadgetron.parseGadgetronStreamConfigurationXml(data, index, callback);
        }
        else{
            callback(gadgetronStreamConfigurationGroup);
        }
    }
}

module.exports = gadgetron;