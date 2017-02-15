import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

Backbone.$ = $;

var ToolBarView = Backbone.View.extend({
    tagName: 'nav',
    className: 'navbar navbar-default',
    initialize: function(attributes, options){
        this.template =  _.template($(attributes.template).html());
        this.toolBarClickedEvent = attributes.toolBarClickedEvent;
    },
    events: {
        'click .toolbar-btn': "clicked",
    },
    clicked: function(event){
        event.data = this.model;
        this.toolBarClickedEvent(event);
    },
    render: function(){
        this.$el.html(this.template);
        return this;
    }
});


module.exports = ToolBarView;