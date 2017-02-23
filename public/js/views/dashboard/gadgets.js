import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import GadgetronStreamCollectionView from './../gadgetronStreamConfiguration/collectionView';
import GadgetRow from './gadgetRow';

Backbone.$ = $;

// view for gadget collection
var Gadgets = Backbone.View.extend({
    template: _.template($("#dashboard-template").html()),
    table: _.template($("#table").html()),
    initialize: function(attributes, options){
        this.clickedEvent = attributes.clickedEvent;
        this.title = attributes.title;
        this.className = attributes.className;
        this.height = attributes.height + 'px';
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
        var table = this.table({attribute: 'Name'});
        var dashboardConfigurationTemplate = this.template({title: this.title, className: this.className, content: $(table).prop('outerHTML'), height: this.height, buttons: ['add']});
        this.$el.html(dashboardConfigurationTemplate);
        // add for each element in collection a row
        if(typeof this.collection != 'undefined'){
            this.collection.forEach(this.addGadget, this);
        }
        return this;
    },    
    addGadget: function(gadget){
        // append gadget row
        var gadgetRow = new GadgetRow({model: gadget, type: this.type});
        this.$el.find('#row').append(gadgetRow.render().el);
    }
});

module.exports = Gadgets;