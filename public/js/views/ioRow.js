import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

var IoRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#io-row").html()),
    initialize: function(attributes, options){
        this.type = attributes.type;
        this.selectEvent = attributes.selectEvent;
    },
    events:{
        "click #select-io": "selectEvent"
    },
    selectEvent: function(event){
        this.selectEvent(event,this.model);
        $('#modal').modal('hide');
    },
    render: function(){
        var rowTemplate = this.template(this.model.toJSON());
        this.$el.html(rowTemplate);
        return this;
    }
});

module.exports = IoRow;