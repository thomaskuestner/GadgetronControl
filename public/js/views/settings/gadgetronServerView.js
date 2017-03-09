import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

Backbone.$ = $;

// Configuration view
var GadgetronServerView = Backbone.View.extend({
    initialize: function(){
    },
    events:{
        'click #start-gadgetron': 'startGadgetron'
    },
    template: _.template($("#gadgetronServer-template").html()),
    render: function() {
        self = this;
        var databaseTemplate = this.template();
        this.$el.html(databaseTemplate);
        return this;
    },
    startGadgetron: function(event){
        var self = this;
        Backbone.ajax({
            url: "/api/gadgetron/restart",
            type: 'POST',
            success: function(data){
            }
        });
    }
});

module.exports = GadgetronServerView;