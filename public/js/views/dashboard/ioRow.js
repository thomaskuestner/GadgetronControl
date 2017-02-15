import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

// view of a reader/writer table row
var IoRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#io-dashboard-row").html()),
    initialize: function(attributes, options){
        this.type = attributes.type;
        this.selectEvent = attributes.selectEvent;
    },
    render: function(){
        var rowTemplate = this.template({model: this.model.toJSON(), type: this.type});
        this.$el.html(rowTemplate);
        return this;
    }
});

module.exports = IoRow;