import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

var GadgetRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#gadget-row").html()),
    initialize: function(attributes, options){
        this.selectGadgetEvent = attributes.selectGadgetEvent;
    },
    events:{
        "click #select-gadget": "selectGadgetEvent"
    },
    selectGadgetEvent: function(event){
        this.selectGadgetEvent(event,this.model);
        $('#modal').modal('hide');
    },
    render: function(){
        var gadgetRowTemplate = this.template(this.model.toJSON());
        this.$el.html(gadgetRowTemplate);
        return this;
    }
});

module.exports = GadgetRow;