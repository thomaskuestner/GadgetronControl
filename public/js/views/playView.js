import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Model
import File from './../models/fileModel';

// Extra
import config from './../../../config.json';

var PlayView = Backbone.View.extend({
    id: 'play-modal',
    className: 'modal fade',    
    template: _.template($("#play-template").html()),
    initialize: function(options) {
        this.datFolderCollection = options.datFolderCollection;
        this.xslFolderCollection = options.xslFolderCollection;
        this.resultFolderCollection = options.resultFolderCollection;
        this.redirectEvent = options.redirectEvent;
        _.bindAll(this, 'show', 'render');
        this.render();
    },
    render: function() {
        this.$el.html(this.template({
            xslFolderCollection: this.xslFolderCollection,
            datFolderCollection: this.datFolderCollection
        }));
        this.$el.modal({show:true}); // dont show modal on instantiation
        this.$el.on('hidden.bs.modal', _.bind(function() {
            this.hide();
        }, this));
        return this;
    },
    show: function() {
        this.$el.modal('show');
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
                    if(res.status === 'SUCCESS'){ 
                        if(res.data.h5){
                            var file = new File(res.data.h5);
                            self.datFolderCollection.add(file);
                        }                        
                        if(res.data.dat){
                            var file = new File(res.data.dat);
                            self.datFolderCollection.add(file);
                        }
                        self.render();
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
                success: function(res){
                    if(res.status === 'SUCCESS'){                                                
                        if(res.data.xsl){
                            var file = new File(res.data.xsl);
                            self.xslFolderCollection.add(file);
                        }
                        self.render();
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
        this.$el.modal('hide');
        if(this.redirectEvent){
            this.redirectEvent('#');
        }
        Backbone.ajax({
            url: '/api/gadgetronIsmrmrdClient/start',
            type: 'GET',
            data: {
                    configurationPath,
                    dataPath,
                    xslPath,
                    resultFileName
                },
            success: function(res){
                if(res.status === 'SUCCESS'){
                    var datFile = new FileModel({
                        name: res.data.filename,
                        path: res.data.path
                    });
                    self.resultFolderCollection.add(datFile);
                }
            }
        });
    },
    hide: function() {
        this.$el.data('modal', null);
        this.remove();
    }
});

module.exports = PlayView;