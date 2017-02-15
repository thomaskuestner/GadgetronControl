import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import IoRow from './ioRow';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

jQuery.noConflict(true);

var LoginDialog = Backbone.View.extend({
    el: '#modal-region',
    template: _.template($("#login-template").html()),
    initialize: function(attributes, options){
        this.loggedInEvent = attributes.loggedInEvent;
    },
    events:{
        'click #login-button': 'clickedLoginButton',
    },
    clickedLoginButton: function(event){
        var self = this;
        var name = $('#name').val();
        var password = $('#password').val();
        if(!name){
            $('#name-group').addClass('has-error');
        }
        else{
            $('#name-group').removeClass('has-error');
        }
        if(!password){
            $('#password-group').addClass('has-error');
        }
        else{
            $('#password-group').removeClass('has-error');
        }
        if(name && password){
            Backbone.ajax({
                url: '/api/login',
                type: 'POST',
                data: {
                    name,
                    password
                },
                success: function(data){
                    if(data.isLoggedIn){
                        self.loggedInEvent();
                        $('#modal').modal('hide');
                    }
                    else{
                        $('#name-group').addClass('has-error');
                        $('#password-group').addClass('has-error');
                    }
                }
            });
        }
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: 'Admin-Login'});
        $('#modal-region').html(modalTemplate);
        var modalBodyTemplate = this.template();
        $('#modal-template-body').html(modalBodyTemplate);
        $('#modal').modal('show');
        return this;
    }
});

module.exports = LoginDialog;