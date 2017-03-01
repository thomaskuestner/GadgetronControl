import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

// Views
import IoView from './../ioView';

// view of a reader/writer table row
var IoRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#io-dashboard-row").html()),
    initialize: function(attributes, options){
        this.type = attributes.type;
        this.selectEvent = attributes.selectEvent;
    },  
    events: {
        'click #trash-button': 'clickTrashButtonEvent',
        'click #edit-button': 'clickEditButtonEvent'
    },
    clickTrashButtonEvent: function(event){
        this.model.removeFromDb(this.type);
    },
    clickEditButtonEvent: function(event){
        var ioView = new IoView({
            type: this.type,
            action: 'update',
            model: this.model.clone()
        });
        ioView.show();
    },
    render: function(){
        var rowTemplate = this.template({model: this.model.toJSON(), type: this.type});
        this.$el.html(rowTemplate);
        return this;
    }
});

module.exports = IoRow;