import Backbone from 'backbone';
import xml2js from 'xml2js';
Backbone.$ = require('jquery');

// Model for configuration(XML)-file
var GadgetronStreamConfiguration = Backbone.Model.extend({
    // create a new configuration-Model and triggers saveing it on the server
    // fileName: filename on server
    createModel: function(fileName){
        if(!fileName){
            fileName = this.get('name');
        }
        else{
            // check if fileName has an xml-extenstion
            var splittedFileName = fileName.split('.');
            if(splittedFileName.length > 1){
                if(splittedFileName.pop() != 'xml'){
                    return false;
                }
            }
            // otherwise set it to xml
            else{
                fileName = fileName + ".xml";
            }
        }
        this.set('name',fileName);
        this.set('configuration',{
            // set namespaces
            gadgetronStreamConfiguration: {
                $: {
                    "xmlns": "http://gadgetron.sf.net/gadgetron",
                    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                    "xsi:schemaLocation": "http://gadgetron.sf.net/gadgetron gadgetron.xsd"
                },
                gadget: new Array(),
                writer: new Array(),
                reader: new Array()
            }
        });
        var builder = new xml2js.Builder();
        // convert model to xml
        var xml = builder.buildObject(this.get('configuration'));
        // triggers saveing on server
        Backbone.ajax({
            type: 'POST',
            url: "/api/gadgetronStreamConfiguration",
            data: {
                fileName: fileName,
                content: xml
            }
        });

        return fileName;
    },
    // triggers saveing configuration on server
    saveModel: function(fileName){
        if(!fileName){
            fileName = this.get('name');
        }
        else{
            // check if fileName has an xml-extenstion
            var splittedFileName = fileName.split('.');
            if(splittedFileName.length > 1){
                if(splittedFileName.pop() != 'xml'){
                    return false;
                }
            }
            // otherwise set it to xml
            else{
                fileName = fileName + ".xml";
            }
        }
        var builder = new xml2js.Builder();
        var configuration = this.get('configuration');
        //delete type property
        for(var gadget in configuration.gadgetronStreamConfiguration.gadget){
            for(var property in configuration.gadgetronStreamConfiguration.gadget[gadget].property){
                delete configuration.gadgetronStreamConfiguration.gadget[gadget].property[property].type;
                // delete empty property
                if(configuration.gadgetronStreamConfiguration.gadget[gadget].property[property].name[0] === ''){
                    configuration.gadgetronStreamConfiguration.gadget[gadget].property.splice(property,1);
                }
            }
        }
        // convert model to xml
        var xml = builder.buildObject(configuration);
        // check if fileName has an xml-extenstion
        Backbone.ajax({
            type: 'POST',
            url: "/api/gadgetronStreamConfiguration",
            data: {
                fileName: fileName,
                content: xml
            }
        });

        return fileName;
    }
});

module.exports = GadgetronStreamConfiguration;
