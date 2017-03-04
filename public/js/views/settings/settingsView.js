import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Views
import ConfigurationView from './configurationView';

Backbone.$ = $;

// Settings view
var SettingsView = Backbone.View.extend({
    initialize: function(attributes, options){
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
        $(this.el).show();
    }
});

module.exports = SettingsView;