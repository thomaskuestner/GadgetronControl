import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

var Row = Backbone.View.extend({
    tagName: 'tr',
    initialize: function(attributes, options){
        this.parent = attributes.parent;
        this.clickEvent = attributes.clickEvent;
        this.listenTo(this.model,'change:status', this.statusChanged);
        this.row = attributes.row || '#file-row';
    },
    events: {
        "click": "clicked"
    },
    clicked: function(event){
        this.clickEvent(event, this.model, this.parent);
    },
    statusChanged: function(){
        this.$el.hide();
    },
    render: function(){
        this.template = _.template($(this.row).html());
        var rowTemplate = this.template(this.model.toJSON());
        this.$el.html(rowTemplate);
        return this;
    }
});

module.exports = Row;