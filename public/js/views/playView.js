import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import FileModel from './../models/fileModel';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);

var PlayView = Backbone.View.extend({
    model: 'FileModel',
    el: '#modal-region',
    template: _.template($("#play-template").html()),
    initialize: function(attributes, options){
        this.datFolderCollection = attributes.datFolderCollection;
        this.xslFolderCollection = attributes.xslFolderCollection;
        this.uploadEvent = attributes.uploadEvent;
    },
    events:{
        'click #upload-dat-button': 'clickedUploadData',
        'change #upload-dat-input': 'changedUploadDataEvent',
        'click #upload-xsl-button': 'clickedUploadXsl',
        'change #upload-xsl-input': 'changedUploadXslEvent',
        'click #start-button': 'clickedStartButton'
    },
    clickedUploadData: function(event){
        $('#upload-dat-input').click();
        $('#progress-dat-bar').text('0%');
        $('#progress-dat-bar').width('0%');
    },    
    clickedUploadXsl: function(event){
        $('#upload-xsl-input').click();
        $('#progress-xsl-bar').text('0%');
        $('#progress-xsl-bar').width('0%');
    },
    changedUploadDataEvent: function(event){
        var self = this;
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
                success: function(res){
                    if(res.extension === 'dat' || res.extension === 'h5'){
                        if(res.status === 'SUCCESS'){
                            if(res.data.dat){
                                var datFile = new FileModel(res.data.dat);
                                self.datFolderCollection.add(datFile);
                            }
                            if(res.data.h5){
                                var datFile = new FileModel(res.data.h5);
                                self.datFolderCollection.add(datFile);
                            }
                            // event is only on dashboard needed
                            if(self.uploadEvent){
                                self.uploadEvent();
                            }
                            $('#modal-template-body').html(self.template({
                                xslFolderCollection: self.xslFolderCollection,
                                datFolderCollection: self.datFolderCollection
                            }));
                        }
                    }
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(event) {
                        if (event.lengthComputable) {
                            var percentComplete = event.loaded / event.total;
                            percentComplete = parseInt(percentComplete * 100);
                            $('#progress-dat-bar').text(percentComplete + '%');
                            $('#progress-dat-bar').width(percentComplete + '%');
                            if (percentComplete === 100) {
                                $('#progress-dat-bar').html('Done');
                            }
                        }
                    }, false);

                    return xhr;
                }
            });
        }
    },
    changedUploadXslEvent: function(event){
        var self = this;
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
                    if(data.extension === 'xsl'){
                        if(data.status){
                            var datFile = new FileModel({
                                name: data.filename,
                                path: data.path
                            });
                            self.xslFolderCollection.add(datFile);
                            // event is only on dashboard needed
                            if(self.uploadEvent){
                                self.uploadEvent();
                            }
                            $('#modal-template-body').html(self.template({
                                xslFolderCollection: self.xslFolderCollection,
                                datFolderCollection: self.datFolderCollection
                            }));
                        }
                    }
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(event) {
                        if (event.lengthComputable) {
                            var percentComplete = event.loaded / event.total;
                            percentComplete = parseInt(percentComplete * 100);
                            $('#progress-xsl-bar').text(percentComplete + '%');
                            $('#progress-xsl-bar').width(percentComplete + '%');
                            if (percentComplete === 100) {
                                $('#progress-xsl-bar').html('Done');
                            }
                        }
                    }, false);

                    return xhr;
                }
            });
        }
    },
    clickedStartButton: function(event){
        var self = this;
        var configurationPath = this.model.get('name');
        var dataPath = $('#dat-selection').find(':selected').data('path');
        var xslPath = $('#xsl-selection').find(':selected').data('path');
        var resultFileName = $('#result-name').val();
        Backbone.ajax({
            url: '/api/gadgetronIsmrmrdClient/start',
            type: 'GET',
            data: {
                    configurationPath,
                    dataPath,
                    xslPath,
                    resultFileName
                },
            success: function(data){
                // event is only on dashboard needed
                if(self.uploadEvent){
                    self.uploadEvent();
                }
                $('#modal').modal('hide');
            }
        });
    },
    render: function() {;
        var modalTemplate = _.template($("#modal-template").html());
        modalTemplate = modalTemplate({title: 'Play Configuration'});
        $('#modal-region').html(modalTemplate);
        $('#modal-template-body').html(this.template({
            xslFolderCollection: this.xslFolderCollection,
            datFolderCollection: this.datFolderCollection
        }));
        $('#modal').modal('show');
        return this;
    }
});

module.exports = PlayView;