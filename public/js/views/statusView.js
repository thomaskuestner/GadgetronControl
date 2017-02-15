import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

Backbone.$ = $;

// load config file
var config = require('./../../../config.json');

// view for gadgetronstatus
var StatusView = Backbone.View.extend({    
    template: _.template($("#status-template").html()),
    initialize: function(attributes, options){
        var self = this;
        // listen on websocket
        this.socket = new WebSocket('ws://' + window.location.hostname + ':' + config.port + '/gadgetronstate');
        this.socket.onmessage = function(msg){
            self.onMessageEvent(msg);
        }	
    },
    // handels on message event
    onMessageEvent: function(msg){
        var data = JSON.parse(msg.data);
        if(this.lastState != data.state){
            if(data.processArgument === ''){
                data.processArgument = 'no arguments';
            }
            if(data.state === 'on'){
                this.$el.html(`<img src="img/Gadgetron_Success.png" title="Started with ${data.processArgument}" height="22px"/>`);
            }
            else{
                this.$el.html(`<img src="img/Gadgetron_Error.png" title="You have to start gadgetron on the server" height="22px"/>`);
            }
        }
        this.lastState = data.state;
    },
    render: function() {
        this.$el.html(this.template);
        return this;
    }
});

module.exports = StatusView;