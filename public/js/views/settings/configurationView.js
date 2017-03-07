import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Model
import Configuration from './../../models/configurationModel';

// Collection
import ConfigurationCollection from './../../collections/configurationCollection';

// Views
import ConfigurationRow from './configurationRow';

// Extra
import config from './../../../../config.json';

Backbone.$ = $;

// Configuration view
var ConfigurationView = Backbone.View.extend({
    initialize: function(attributes, options){
        var self = this;
        this.collection = new ConfigurationCollection();
        this.listenTo(this.configurationGroup,'add', this.render);
        var values = Object.values(config);
        var keys = Object.keys(config);
        keys.forEach(function(data, index){
            var configuration = new Configuration();
            configuration.set('key', keys[index]);
            configuration.set('value', values[index]);
            self.collection.add(configuration);
        });
    },
    events:{
        'click #save-configuration-json': 'save'
    },
    template: _.template($("#configuration-template").html()),
    render: function() {
        self = this;
        var configurationTemplate = this.template();
        this.$el.html(configurationTemplate);
        if(typeof this.collection != 'undefined'){
            this.collection.forEach(this.addConfiguration, this);
        }
        return this;
    },
    addConfiguration: function(configuration){
        var configurationRow = new ConfigurationRow({model: configuration});
        this.$el.find('tbody').append(configurationRow.render().el);
    },
    save: function(events){
        // save config.json & restart server
        this.collection.saveConfiguration();
    }
});

module.exports = ConfigurationView;
