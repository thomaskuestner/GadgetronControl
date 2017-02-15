import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
Backbone.$ = $;

// view for single configuration row
var GadgetronStreamRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#configuration-row").html()),
    render: function(){
        // append row
        var configurationRowTemplate = this.template(this.model.toJSON());
        this.$el.html(configurationRowTemplate);
        return this;
    }
});

module.exports = GadgetronStreamRow;