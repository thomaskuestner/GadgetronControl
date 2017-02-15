import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import GadgetRow from './gadgetRow';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);

var Gadgets = Backbone.View.extend({
    template: `
    <table class="table table-striped data-editable-spy">
        <thead>
            <tr>
                <th>Name</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="row"></tbody>
    </table>`,
    initialize: function(attributes, options){
        this.selectGadgetEvent = attributes.selectGadgetEvent;
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: 'Gadgets'});
        $('#modal-region').html(modalTemplate);
        $('#modal-template-body').html(this.template);
        if(typeof this.collection != 'undefined'){
            this.collection.forEach(this.addGadget, this);
        }
        $('#modal').modal('show');
        return this;
    },
    addGadget: function(gadget){
        var gadgetRow = new GadgetRow({model: gadget, selectGadgetEvent: this.selectGadgetEvent});
        $('#row').append(gadgetRow.render().el);
    }
});

module.exports = Gadgets;