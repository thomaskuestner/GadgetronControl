import Backbone from 'backbone';
import GadgetronStreamConfiguration from './../models/gadgetronStreamConfigurationModel';

Backbone.$ = require('jquery');

// Collection for configuration(XML)-files
var GadgetronStreamConfigurationCollection = Backbone.Collection.extend({
    model: GadgetronStreamConfiguration,
    // sorts the elements in the collection by name in lowercase
    comparator: function(item){
        return item.get('name').toLowerCase();
    }
});

module.exports = GadgetronStreamConfigurationCollection;
