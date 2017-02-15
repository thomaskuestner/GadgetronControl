import Backbone from 'backbone';
import xml2js from 'xml2js';
Backbone.$ = require('jquery');

// Model for gadget
var Gadget = Backbone.Model.extend({
    // default properties
    defaults:{
        name: "",
        dll: "",
        classname: "",
        properties: ""
    },
    // convert model back to configuration(XML)-style
    convertModel: function(){
        var self = this;
        var convertedModel = {
            classname: Array(this.get('classname')),
            dll: Array(this.get('dll')),
            name: Array(this.get('name')),
            property: this.get('properties')
        }

        return convertedModel;
    },
    // triggers writing gadget in database on server
    writeToDb: function(){
        var self = this;
        Backbone.ajax({
            type: 'POST',
            url: "/api/writeInDb",
            data: {
                type: 'gadget',
                content: this.toJSON()
            },
            success: function(result){
                if(result.status){
                    self.set('_id', result._id);
                }
            }
        });
    },
    // triggers updating gadget in database on server
    updateDb: function(){
        Backbone.ajax({
            type: 'PUT',
            url: "/api/updateDb",
            data: {
                type: 'gadget',
                content: this.toJSON()
            },
            success: function(result){
                if(!result.status){

                }
            }
        });
    },
    // triggers removing gadget from database on server
    removeFromDb: function(callback){
        var status;
        Backbone.ajax({
            type: 'DELETE',
            url: "/api/removeFromDb",
            data: {
                type: 'gadget',
                content: this.toJSON()
            },
            success: function(result){
                if(!result.status){
                    callback(false);
                }
                callback(true);
            },
            statusCode:{
                403: function(response){
                    callback(false);
                }
            }
        });
    }
});

module.exports = Gadget;
