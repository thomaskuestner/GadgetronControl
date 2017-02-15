import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import IoRow from './ioRow';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);

var Ios = Backbone.View.extend({
    template: `
    <table class="table table-striped data-editable-spy">
        <thead>
            <tr>
                <th>Classname</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="row"></tbody>
    </table>`,
    initialize: function(attributes, options){
        this.title = attributes.title;
        this.type = attributes.type;
        this.selectEvent = attributes.selectEvent;
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: this.title});
        $('#modal-region').html(modalTemplate);
        $('#modal-template-body').html(this.template);
        if(typeof this.collection != 'undefined'){
            this.collection.forEach(this.addIo, this);
        }
        $('#modal').modal('show');
        return this;
    },
    addIo: function(io){
        var ioRow = new IoRow({model: io, selectEvent: this.selectEvent, type: this.type});
        $('#row').append(ioRow.render().el);
    }
});

module.exports = Ios;