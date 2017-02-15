import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

// view of a gadget table row
var IoRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#gadget-dashboard-row").html()),
    initialize: function(attributes, options){
        this.type = attributes.type;
    },
    render: function(){
        var rowTemplate = this.template(this.model.toJSON());
        this.$el.html(rowTemplate);
        return this;
    }
});

module.exports = IoRow;