import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import IoRow from './ioRow';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;
var self;
jQuery.noConflict(true);

var UploadDialog = Backbone.View.extend({
    el: '#modal-region',
    template: _.template($("#upload-template").html()),
    initialize: function(attributes, options){
        self = this;
        this.title = attributes.title;
        this.fileextension = attributes.fileextension;
        this.uploadEvent = attributes.uploadEvent;
    },
    events:{
        'click #upload-file-button': 'clickedUploadFile',
        'click #create-symbolic-link': 'clickCreateSymbolicLink',
        'change #upload-file-input': 'changedUploadFileEvent',
    },
    clickedUploadFile: function(event){
        $('#upload-file-input').click();
        $('#progress-file-bar').text('0%');
        $('#progress-file-bar').width('0%');
    },
    changedUploadFileEvent: function(event){
        var files = $(event.currentTarget).get(0).files;
        if (files.length > 0){
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                formData.append('uploads[]', file, file.name);
            }
            Backbone.ajax({
                url: '/api/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    if(data.status){
                        self.uploadFinishedEvent(event);
                    }
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(event) {
                        if (event.lengthComputable) {
                            var percentComplete = event.loaded / event.total;
                            percentComplete = parseInt(percentComplete * 100);
                            $('#progress-file-bar').text(percentComplete + '%');
                            $('#progress-file-bar').width(percentComplete + '%');
                            if (percentComplete === 100) {
                                $('#progress-file-bar').html('Done');
                            }
                        }
                    }, false);

                    return xhr;
                }
            });
        }
    },
    clickCreateSymbolicLink: function(event){
        var self = this;
        var value = $('#filename').val();
        if(!value){
            $('#filename-group').addClass('has-error');
        }
        else{
            Backbone.ajax({
                url: '/api/createSymbolicLink',
                type: 'POST',
                data: {value},
                success: function(data){
                    if(data.status){
                        self.uploadEvent(event);
                    }
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    return xhr;
                }
            });
        }
    },
    uploadFinishedEvent: function(event){
        self.uploadEvent(event);
        $('#modal').modal('hide');
    },
    cleanup: function(){
        this.unbind();
        this.undelegateEvents();
        $(this.el).empty();
    },
    render: function() {
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: this.title});
        $(this.el).html(modalTemplate);
        var modalBodyTemplate = this.template({fileextension: this.fileextension});
        $('#modal-template-body').html(modalBodyTemplate);
        $('#modal').modal('show');
        return this;
    }
});

module.exports = UploadDialog;