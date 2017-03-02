import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

var UnsavedChangesDialog = Backbone.View.extend({
    id: 'unsaved-modal',
    className: 'modal fade',    
    template: _.template($("#unsaved-template").html()),
    events: {
        'click #yes-button': 'route',
    },
    initialize: function(options) {
        this.redirectEvent = options.redirectEvent;
        this.direction = options.direction;
        this.gadgetronStreamConfigurationView = options.gadgetronStreamConfigurationView;
        _.bindAll(this, 'show', 'render');
        this.render();
    },
    show: function() {
        this.$el.modal('show');
    },
    hide: function() {
        this.$el.data('modal', null);
        this.remove();
        return false;
    },
    route: function(){
        this.gadgetronStreamConfigurationView.unsavedChanges = false;
        this.$el.modal('hide');
        this.redirectEvent(this.direction);
    },
    render: function() {
        this.$el.html(this.template);
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
    }
});

module.exports = UnsavedChangesDialog;