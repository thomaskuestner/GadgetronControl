import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

var GadgetView = Backbone.View.extend({
    id: 'gadget-modal',
    className: 'modal fade',    
    template: _.template($("#gadget-template").html()),
    events: {
        'input .property': 'inputPropertyEvent',
        'input #name': 'inputEvent',
        'input #dll': 'inputEvent',
        'input #classname': 'inputEvent',
        'click #save-button': 'clickedSaveButton',
        'submit #gadget-form': 'submit'
    },
    initialize: function(options) {        
        this.action = options.action || 'add';
        this.renderPropertyTypes = options.renderPropertyTypes || false;
        _.bindAll(this, 'show', 'render');
        this.render();
    },
    show: function() {
        $('#login-form').submit(function () {
            e.preventDefault();
        });
        this.$el.modal('show');
    },
    hide: function() {
        this.$el.data('modal', null);
        this.remove();
    },
    render: function() {
        if(this.renderPropertyTypes){
            var properties = this.model.get('properties');
            if(properties){
                properties.forEach(function(property){
                    var value = property.value[0];
                    if(value === 'true' || value === 'false' || value === true || value === false){
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
        }
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
    },
    inputPropertyEvent: function(event){
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
        var property = properties[index];

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
                        if(!isNaN($(event.target).text())){
                            value = $(event.target).text();
                        }
                        else{
                            $(event.target).text(property.value[0]);
                        }
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
    inputEvent: function(event){
        var value = $(event.currentTarget).val();
        var id = $(event.currentTarget)[0].id;
        this.model.set(id, value);
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
                break;
            case 'update':
                this.model.updateDb();
                break;
            default:
                break;
        }
        if(this.collection){
            this.collection.add(this.model);
        }
        this.$el.modal('hide');
    },
    submit: function(event){
        event.preventDefault();
        this.loginUser(event);
    }
});

module.exports = GadgetView;