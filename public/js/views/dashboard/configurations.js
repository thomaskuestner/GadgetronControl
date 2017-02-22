import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import GadgetronStreamCollectionView from './../gadgetronStreamConfiguration/collectionView';

Backbone.$ = $;

// Configuration(XML)-View
var Configurations = Backbone.View.extend({    
    template: _.template($("#dashboard-template").html()),
    initialize: function(attributes, options){
        this.playButtonClickEvent = attributes.playButtonClickEvent;
        this.height = attributes.height + 'px';
    },
    render: function() {
        // insert GadgetronStreamCollectionView in dashboard
        var gadgetronStreamCollectionView = new GadgetronStreamCollectionView({ collection: this.collection, playButtonClickEvent: this.playButtonClickEvent});
        var content = gadgetronStreamCollectionView.render().el;
        var dashboardConfigurationTemplate = this.template({title: 'Configurations', content: $(content).prop('outerHTML'), height: this.height, buttons: ['add', 'upload']});
        this.$el.html(dashboardConfigurationTemplate);
        return this;
    }
});

module.exports = Configurations;