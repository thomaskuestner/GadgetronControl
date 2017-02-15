import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import GadgetModel from './../models/gadgetModel';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);

var GadgetView = Backbone.View.extend({
    model: 'GadgetModel',
    el: '#modal-region',
    template: _.template($("#gadget-template").html()),
    initialize: function(attributes, options){
        this.action = attributes.action || 'add';
        this.renderPropertyTypes = attributes.renderPropertyTypes || false;
        this.savedEvent = attributes.savedEvent;
    },
    events:{
        'input .property': 'inputPropertyEvent',
        'input #name': 'inputEvent',
        'input #dll': 'inputEvent',
        'input #classname': 'inputEvent',
        'click #save-button': 'clickedSaveButton',
        'click #back': 'close',
        'click .modal.fade': 'close'
    },
    inputEvent: function(event){
        var value = $(event.currentTarget).val();
        var id = $(event.currentTarget)[0].id;
        this.model.set(id, value);
    },
    inputPropertyEvent: function(event){
        console.log('inputPropertyEvent');
        var properties = this.model.get('properties');
        // initialize properties if empty
        if(properties === ""){
            properties = new Array();
        }
        var index = $(event.target).data('index');
        if(!properties[index]){
            properties[index] = {
                name: new Array(""),
                value: new Array("")
            };
        }
        // get property
        var property = properties.filter((num, index) => index == index)[0];

        // set properties
        var nameOrValue = $(event.target).data('value');
        switch (nameOrValue) {
            case 'name':
                property.name[0] = $(event.target).text();
                break;
            case 'value':
                // get type and extract value
                var type = $(event.target).data('type');
                var value;
                switch (type) {
                    case 'number':
                        value = $(event.target).text();
                        break;
                    case 'boolean':
                        value = $(event.target)[0].checked;
                        break;
                    case 'string':
                        value = $(event.target).text();                        
                        break;
                    default:
                        break;
                }
                property.value[0] = value;
                break;                
            default:
                break;
        }
        properties[index] = property;
        console.log(properties);
        // set properties of model
        this.model.set('properties', properties);
        
        // Check if next row has to be added
        var nextId = parseInt(index) + 1;
        if($('#row-' + nextId).length == 0){
            // add property
            properties[nextId] = {
                name: new Array(""),
                value: new Array("")
            }
            this.model.set('properties', properties);
            // rerender
            this.render();
        }
    },
    clickedSaveButton: function(event){
        var properties = new Array();
        var propertiesBuffer = this.model.get('properties');
        if(propertiesBuffer !== ''){
            propertiesBuffer.forEach(function(property, index){
                if(property.name[0] != ''){
                    properties.push(property);
                }
            })
            this.model.set('properties', properties);
        }
        else{
            this.model.set('properties', properties);
        }
        switch (this.action) {
            case 'add':
                this.model.writeToDb(); 
                this.savedEvent(event, this.model);               
                break;
            case 'update':
                this.model.updateDb();
                this.savedEvent(event, this.model);
                break;
            case 'none':
                this.savedEvent(event, this.model.convertModel());
                break;
            default:
                break;
        }
        this.unbind();
        this.undelegateEvents();
        $('#modal').modal('hide');
    },
    close: function(event){
        if(($(event.target).hasClass('modal') && $(event.target).hasClass('fade')) || $(event.target).id === 'back'){
            this.unbind();
            this.undelegateEvents();
        }
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: 'Gadget'});
        // add property-types in configuration View
        if(this.renderPropertyTypes){
            var properties = this.model.get('properties');
            properties.forEach(function(property, index){
                var value = property.value[0];
                if(value === 'true' || value === 'false'){
                    property.type = 'boolean';
                }
                else if(!isNaN(value)){
                    property.type = 'number';
                }
                else{
                    property.type = 'string';
                }
            });
        }
        // don't show it again, when is already visible
        if($('#modal').hasClass('in')){
            var gadgetTemplate = this.template(this.model.toJSON());
            $('#modal-template-body').html(gadgetTemplate);
        }
        else{
            $('#modal-region').html(modalTemplate);
            var gadgetTemplate = this.template(this.model.toJSON());
            $('#modal-template-body').html(gadgetTemplate);
            $('#modal').modal('show');
        }
        
        return this;
    }
});

module.exports = GadgetView;