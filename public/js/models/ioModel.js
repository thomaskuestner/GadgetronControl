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
        var self = this;
        Backbone.ajax({
            type: 'PUT',
            url: "/api/updateDb",
            data: {
                type: type,
                content: this.toJSON()
            },
            success: function(result){
                if(result.status === true){
                    self.collection.remove(self.origin);
                    self.collection.add(self);
                }
            }
        });
    },
    // triggers removing reader/writer from database on server
    removeFromDb: function(type, callback){
        var self = this;
        Backbone.ajax({
            type: 'DELETE',
            url: "/api/removeFromDb",
            data: {
                type: type,
                content: this.toJSON()
            },
            success: function(result){
                self.collection.remove(self);
            }
        });
    },
    // override clone
    // because a deep clone is needed
    clone: function(){
        var clone = new IoModel($.extend(true, {}, this.toJSON()));
        clone.origin = this;
        clone.collection = this.collection;
        return clone;
    }
});

module.exports = IoModel;
