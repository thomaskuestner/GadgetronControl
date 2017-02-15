import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import Row from './row';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

jQuery.noConflict(true);

var Login = Backbone.View.extend({
    el: '#navbar-right',
    template: _.template($("#login-status-template").html()),
    events:{
        'click #logout-button': 'clickedLogoutButton',
        'click #login-button': 'clickedLoginButton',
    },
    clickedLoginButton: function(event){
        // Just make a request that needs admin rights and the global error handling will bring Login-Dialog
        Backbone.ajax({
            url: '/api/removeFromDb',
            type: 'DELETE'
        });
    },
    clickedLogoutButton: function(event){
        var self = this;
        Backbone.ajax({
            url: '/api/logout',
            type: 'POST',
            success: function(data){                
                self.$el.html(self.template(data));
                self.render();
            }
        });
    },
    show: function() {
        var self = this;
        Backbone.ajax({
            url: '/api/user',
            type: 'GET',
            success: function(data){                
                self.$el.html(self.template(data));
            }
        });
        return this;
    },
    render: function() {
        this.show();
        return this;
    }
});

module.exports = Login;