import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

var GadgetRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#configuration-json-row").html()),
    initialize: function(attributes, options){;
    },
    events:{
        'input': 'inputConfigEvent',
    },
    render: function(){
        var configurationRowTemplate = this.template(this.model.toJSON());
        this.$el.html(configurationRowTemplate);
        return this;
    },
    inputConfigEvent: function(event){
        var value = $(event.target).text();
        this.model.set('value', value);
    }
});

module.exports = GadgetRow;