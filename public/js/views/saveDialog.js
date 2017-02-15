import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import IoRow from './ioRow';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

jQuery.noConflict(true);

var SaveDialog = Backbone.View.extend({
    el: '#modal-region',
    template: _.template($("#save-as-template").html()),
    initialize: function(attributes, options){
        this.title = attributes.title;
        this.data = attributes.data;
        this.saveEvent = attributes.saveEvent;
    },
    events:{
        'click #save-as': "saveEvent",
    },
    saveEvent: function(event){
        var value = $('#filename').val();
        if(!value){
            $('#filename-group').addClass('has-error');
        }
        this.saveEvent(event, value);
    },
    render: function() {;
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: this.title});
        $('#modal-region').html(modalTemplate);
        $('#modal-template-body').html(this.template);
        $('#modal').modal('show');
        return this;
    }
});

module.exports = SaveDialog;