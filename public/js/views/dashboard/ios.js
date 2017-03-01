import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import GadgetronStreamCollectionView from './../gadgetronStreamConfiguration/collectionView';

import IoRow from './ioRow';

Backbone.$ = $;

// view for reader/writer collection
var Ios = Backbone.View.extend({    
    template: _.template($("#dashboard-template").html()),
    table: _.template($("#table").html()),
    initialize: function(attributes, options){
        this.clickedEvent = attributes.clickedEvent;
        this.title = attributes.title;
        this.className = attributes.className;
        this.height = attributes.height + 'px';
        this.type = attributes.type;
        this.listenTo(this.collection,'add', this.render);
        this.listenTo(this.collection,'remove', this.render);
    },    
    events: {
        'click': 'clickedEvent'
    },
    clickedEvent: function(event){
        this.clickedEvent(event);
    },
    render: function() {
        var table = this.table({attribute: 'Classname'});
        var dashboardConfigurationTemplate = this.template({title: this.title, className: this.className, content: $(table).prop('outerHTML'), height: this.height, buttons: ['add']});
        this.$el.html(dashboardConfigurationTemplate);
        // add for each element in collection a row    
        if(typeof this.collection != 'undefined'){
            this.collection.forEach(this.addIo, this);
        }
        return this;
    },    
    addIo: function(io){
        // append reader/writer row
        var ioRow = new IoRow({model: io, collection: this.collection, selectEvent: this.selectEvent, type: this.type});
        this.$el.find('#row').append(ioRow.render().el);
    }
});

module.exports = Ios;