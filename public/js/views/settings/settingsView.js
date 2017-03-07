import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Views
import ConfigurationView from './configurationView';
import DatabaseView from './databaseView';
import GadgetronServerView from './gadgetronServerView';

Backbone.$ = $;

// Settings view
var SettingsView = Backbone.View.extend({
    initialize: function(attributes, options){
        this.gadgetGroup = attributes.gadgetGroup;
        this.readerGroup = attributes.readerGroup;
        this.writerGroup = attributes.writerGroup;
    },
    template: _.template($("#settings").html()),
    render: function() {
        var settingsTemplate = this.template();
        this.$el.html(settingsTemplate);
        $(this.el).hide();
        return this;
    },
    close: function(){
        this.remove();
        this.unbind();
    },
    onShow: function(){
        this.configurationView = new ConfigurationView();
        $('#configuration-view').html(this.configurationView.render().el);    
        this.databaseView = new DatabaseView({gadgetGroup: this.gadgetGroup, readerGroup: this.readerGroup, writerGroup: this.writerGroup});
        $('#database-view').html(this.databaseView.render().el);
        this.gadgetronServerView = new GadgetronServerView();
        $('#gadgetronServer-view').html(this.gadgetronServerView.render().el);    
        $(this.el).show();
    }
});

module.exports = SettingsView;