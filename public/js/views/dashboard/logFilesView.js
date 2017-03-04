import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

Backbone.$ = $;

// load config file
var config = require('./../../../../config.json');

// view for logs
var LogFilesView = Backbone.View.extend({    
    template: _.template($("#dashboard-template").html()),
    initialize: function(attributes, options){
        var self = this;
        this.title = attributes.title;
        this.height = attributes.height;
        this.content = attributes.content;
        // listen on websocket
        this.socket = new WebSocket('ws://' + window.location.hostname + ':' + config.port + '/logbroadcast');
        this.socket.onmessage = function(msg){
            self.onMessageEvent(msg);
        }	
    },
    events: {
        'click #download-button': 'clickedDownloadButtonEvent',
        'click': 'clickEvent',
        'contextmenu': 'contextmenuEvent'
    },
    // handels on message event
    onMessageEvent: function(msg){
        var data = JSON.parse(msg.data);
        var color;
        // set different log levels
        switch (data.loglevel) {
            case 'DEBUG':
                color = 'gray';
                break;
            case 'INFO':
                color = 'black';
                break;
            case 'WARNING':
                color = 'orange';
                break;
            case 'ERROR':
                color = 'red';
                break;
            case 'SUCCESS':
                color = 'green';
                break;
            default:
                break;
        }

        $('#log').append(`<p style="color:${color};" data-sender="${data.sender}"><span style="color:gray">${new Date().toISOString()}</span> ${data.data}</p>`);
        var logDiv = document.getElementById("log");
        if(logDiv){
            logDiv.parentNode.scrollTop = logDiv.parentNode.scrollHeight;
        }
        // save content if view is rendered again
        if($('#log')[0]){
            this.content = $('#log')[0].innerHTML;
        }
        else{
            this.content = [this.content, `<p style="color:${color};" data-sender="${data.sender}"><span style="color:gray">${new Date().toISOString()}</span> ${data.data}</p>`].join('');
        }
    },
    // handels download button click event
    clickedDownloadButtonEvent: function(event){
        // create logFile
        var children = $('#log')[0].children;
        var logFile = new Array();
        for(var index in children){
            if(children[index].innerText){
                logFile.push(children[index].innerText);
            }
        }

        // create download
        var element = document.createElement('a');
        var date = new Date();
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + logFile.join('%0A'));
        element.setAttribute('download', `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.log`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    },
    clickEvent: function(event){
        $("#filter-menu").hide();
    },
    contextmenuEvent: function(event){
        event.preventDefault();
        if($("#filter-menu:visible").length === 0){
            var wrapper = $('body').parent();
            var parentOffset = wrapper.offset();
            var relX = event.pageX - parentOffset.left + wrapper.scrollLeft();
            var relY = event.pageY - parentOffset.top + wrapper.scrollTop();

            $(this).append($('#filter-menu').css({
                position: 'absolute',
                display: 'block',
                left: relX,
                top: relY
            }));
        }
        else{
            $("#filter-menu:visible").hide();
        }
    },
    render: function() {
        var content;
        if(this.content){
            content = `<div id="log">${this.content}</div>`;
        }
        else{
            content = `<div id="log"></div>`;
        }     
        this.dashboardConfigurationTemplate = this.template({title: this.title, buttons: [], content, className: 'log-file', height: [this.height,'px'].join(''), buttons: ['download']});
        this.$el.html(this.dashboardConfigurationTemplate);
        $('.log-control-check').change(function(event){
            var checked = $(event.currentTarget).is(":checked");
            var id = event.currentTarget.id;
            $('*').filter(function() {
                if($(this).data('sender') === id){
                    if(checked){
                        $(this).show();
                    }
                    else{
                        $(this).hide();
                    }
                }
            });
        });
        return this;
    }
});

module.exports = LogFilesView;