import Backbone from 'backbone';
Backbone.$ = require('jquery');

// Model for file
var File = Backbone.Model.extend({
    // triggers to move file to trash on server
    toTrash: function(){
        var self = this;
        Backbone.ajax({
            type: 'POST',
            url: "/api/fileToTrash",
            data: {
                fileName: this.get('path')
            },
            success: function(result){
                if(result.status){
                    self.set('status','trashed');
                }
            }
        });
    },
    // triggers to delete file on server
    delete: function(){
        var self = this;
        Backbone.ajax({
            type: 'DELETE',
            url: "/api/fileToTrash",
            data: {
                fileName: this.get('path')
            },
            success: function(result){
                if(result.status){
                    self.set('status','deleted');
                }
            }
        });
    }
});

module.exports = File;
