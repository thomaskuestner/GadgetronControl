import Backbone from 'backbone';
import xml2js from 'xml2js';
import $ from 'jquery';

Backbone.$ = $;

// Model for reader/writer
var IoModel = Backbone.Model.extend({
    // default properties
    defaults:{
        classname: "",
        dll: "",
        slot: "",
    },
    // convert model back to configuration(XML)-style
    convertModel: function(){
        var self = this;
        var convertedModel = {
            classname: Array(this.get('classname')),
            dll: Array(this.get('dll')),
            slot: Array(this.get('slot'))
        }

        return convertedModel;
    },
    // triggers writing reader/writer in database on server
    writeToDb: function(type){
        var self = this;
        Backbone.ajax({
            type: 'POST',
            url: "/api/writeInDb",
            data: {
                type: type,
                content: this.toJSON()
            },
            success: function(result){
                if(result.status){
                    self.set('_id', result._id);
                }
            }
        });
    },
    // triggers updating reader/writer in database on server
    updateDb: function(type){
        Backbone.ajax({
            type: 'PUT',
            url: "/api/updateDb",
            data: {
                type: type,
                content: this.toJSON()
            },
            success: function(result){
                if(!result.status){

                }
            }
        });
    },
    // triggers removing reader/writer from database on server
    removeFromDb: function(type, callback){
        Backbone.ajax({
            type: 'DELETE',
            url: "/api/removeFromDb",
            data: {
                type: type,
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

module.exports = IoModel;
