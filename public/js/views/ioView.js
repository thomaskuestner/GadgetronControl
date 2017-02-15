import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import IoModel from './../models/ioModel';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);

var IoView = Backbone.View.extend({
    model: 'IoModel',
    el: '#modal-region',
    template: _.template($("#io-template").html()),
    initialize: function(attributes, options){
        this.action = attributes.action || 'add';
        this.savedEvent = attributes.savedEvent;
        this.type = attributes.type;
    },
    events:{
        'input #slot': 'inputEvent',
        'input #dll': 'inputEvent',
        'input #classname': 'inputEvent',
        'click #save-button': 'clickedSaveButton',
        'click #back': 'close',
        'click .fade.modal': 'close'
    },
    inputEvent: function(event){
        var value = $(event.currentTarget).val();
        var id = $(event.currentTarget)[0].id;
        this.model.set(id, value);
    },
    clickedSaveButton: function(event){
        switch (this.action) {
            case 'add':
                this.model.writeToDb(this.type);
                this.savedEvent(event, this.model, this.type);
                break;
            case 'update':
                this.model.updateDb(this.type);
                this.savedEvent(event, this.model, this.type);
                break;   
            case 'none':
                this.savedEvent(event, this.model.convertModel(), this.type);
                break;
            default:
                break;
        }
        this.unbind();
        this.undelegateEvents();
        $('#modal').modal('hide');
    },
    close: function(event){
        // .fade.model fires close event, so check target
        if($(event.target)[0].localName !== 'input'){
            this.unbind();
            this.undelegateEvents();
        }
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: 'Io'});
        var ioTemplate = this.template({model: this.model.toJSON(), type: this.type});
        if($('#modal').hasClass('in')){
            $('#modal-template-body').html(ioTemplate);
        }
        else{
            $('#modal-region').html(modalTemplate);
            $('#modal-template-body').html(ioTemplate);
            $('#modal').modal('show');
        }
        
        return this;
    }
});

module.exports = IoView;