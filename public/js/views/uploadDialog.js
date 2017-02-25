import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Model
import File from './../models/fileModel';

// Extra
import config from './../../../config.json';

var UploadDialog = Backbone.View.extend({
    id: 'upload-modal',
    className: 'modal fade',    
    template: _.template($("#upload-template").html()),
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
    initialize: function(options) {
        this.title = options.title;
        this.fileextension = options.fileextension;
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
        this.$el.html(this.template({fileextension: this.fileextension, config, title: this.title}));
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
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
                success: function(res){
                    if(res.status === 'SUCCESS'){
                        if(res.data.h5){
                            var file = new File(res.data.h5);
                            self.collection.add(file);
                        }                        
                        if(res.data.dat){
                            var file = new File(res.data.dat);
                            self.collection.add(file);
                        }                        
                        if(res.data.xml){
                            var file = new File(res.data.xml);
                            self.collection.add(file);
                        }                        
                        if(res.data.xsl){
                            var file = new File(res.data.xsl);
                            self.collection.add(file);
                        }
                        self.$el.modal('hide');
                    }
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    return xhr;
                }
            });
        }
    },
    changedUploadFileEvent: function(event){
        var files = $(event.currentTarget).get(0).files;
        var self = this;
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
                success: function(res){
                    if(res.status === 'SUCCESS'){
                        if(res.data.h5){
                            var file = new File(res.data.h5);
                            self.collection.add(file);
                        }                        
                        if(res.data.dat){
                            var file = new File(res.data.dat);
                            self.collection.add(file);
                        }                        
                        if(res.data.xml){
                            var file = new File(res.data.xml);
                            self.collection.add(file);
                        }                        
                        if(res.data.xsl){
                            var file = new File(res.data.xsl);
                            self.collection.add(file);
                        }
                        self.$el.modal('hide');
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
    }
});

module.exports = UploadDialog;