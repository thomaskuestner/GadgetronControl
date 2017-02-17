import Backbone from 'backbone';
import File from './../models/fileModel';

Backbone.$ = require('jquery');

// Collection for files
var FileCollection = Backbone.Collection.extend({
    model: File,
    initialize: function(){
        this.on( "change:status", this.changeStatus, this);
    },
    // event when FileModel changes his status
    changeStatus: function(model, value, options){
        if(value === 'trashed' || value === 'deleted'){
            this.remove(model);
        }
    },
    // sorts the elements in the collection by name in lowercase
    comparator: function(item){
        return item.get('name').toLowerCase();
    }
});

module.exports = FileCollection;
