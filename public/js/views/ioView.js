module.exports = IoView;

import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

var IoView = Backbone.View.extend({
    id: 'io-modal',
    className: 'modal fade',    
    template: _.template($("#io-template").html()),
    events: {
        'input #slot': 'inputEvent',
        'input #dll': 'inputEvent',
        'input #classname': 'inputEvent',
        'click #save-button': 'clickedSaveButton'
    },
    initialize: function(options) { 
        this.action = options.action || 'add';
        this.type = options.type;
        this.savedEvent = options.savedEvent;
        _.bindAll(this, 'show', 'render');
        this.render();
    },
    show: function() {
        this.$el.modal('show');
    },
    hide: function() {
        this.$el.data('modal', null);
        this.remove();
    },
    render: function() {
        this.$el.html(this.template({model: this.model.toJSON(), type: this.type}));
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
    },
    inputEvent: function(event){
        var value = $(event.currentTarget).val();
        var id = $(event.currentTarget)[0].id;
        this.model.set(id, value);
    },
    clickedSaveButton: function(event){
        switch (this.action) {
            case 'add':
                this.model.writeToDb(this.type);
                this.savedEvent(event, this.model, this.type);
                break;
            case 'update':
                this.model.updateDb(this.type);
                break;   
            case 'none':
                this.savedEvent(event, this.model.convertModel(), this.type);
                break;
            default:
                break;
        }
        this.$el.modal('hide');
    }
});

module.exports = IoView;