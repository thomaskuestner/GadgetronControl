import Backbone from 'backbone';
import Configuration from './../models/configurationModel';

Backbone.$ = require('jquery');

// Collection for configuration of GadgeronControl
var ConfigurationCollection = Backbone.Collection.extend({
    model: Configuration,
    saveConfiguration: function(){
        var newConfig = {};
        this.forEach(function(data, index){
            newConfig[data.get('key')] = data.get('value');
        });
        var self = this;
        Backbone.ajax({
            type: 'POST',
            url: "/api/configuration",
            data: newConfig,
            success: function(res){
                if(res.status === 'SUCCESS'){
                }
            }
        });
    }
});

module.exports = ConfigurationCollection;
