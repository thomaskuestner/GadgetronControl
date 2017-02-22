import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

var LoginDialog = Backbone.View.extend({
    id: 'login-modal',
    className: 'modal fade',    
    template: _.template($("#login-template").html()),
    events: {
        'click #login-button': 'loginUser',
        'submit #login-form': 'submit'
    },
    initialize: function(options) {
        this.login = options.login;
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
    },
    render: function() {
        this.$el.html(this.template);
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
    },
    loginUser: function(event){
        var serializedForm = $("#login-form").serialize();
        var self = this;
        Backbone.ajax({
            url: '/api/login',
            type: 'POST',
            data: serializedForm,
            success: function(res){
                if(res.isLoggedIn === true){
                    self.trigger('loggedin');
                    self.login.show();
                    self.$el.modal('hide');
                }
                else{
                    $('#name-group').addClass('has-error');
                    $('#password-group').addClass('has-error');
                }
            }
        });
    },
    submit: function(event){
        event.preventDefault();
        this.loginUser(event);
    }
});

module.exports = LoginDialog;