import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import Configurations from './configurations';
import SaveDialog from './../saveDialog';
import FolderView from './../folderView';
import PlayView from './../playView';
import UploadDialog from './../uploadDialog';
import Ios from './ios';
import Gadgets from './gadgets';
import FileCollection from './../../collections/fileCollection';
import File from './../../models/fileModel';

import config from './../../../../config.json';

Backbone.$ = $;
var saveDialog;
var gadgets;
var readers;
var writers;
var self;

// Dashboard view
var Dashboard = Backbone.View.extend({
    initialize: function(attributes, options){
        this.redirectEvent = attributes.redirectEvent;
    },
    template: _.template($("#dashboard").html()),
    render: function() {
        self = this;
        var dashboardTemplate = this.template(this.model);
        this.$el.html(dashboardTemplate);
        this.renderFolderViews();
        $(this.el).hide();
        return this;
    },
    // render all Folder Views
    renderFolderViews: function(){
        var height = window.innerHeight - 3 * $('nav').outerHeight() - 4 - 4 * 20;

        // Render Configurations
        var configurationFolderView = new FolderView({ 
            title: 'Configuration-Data',  
            className: 'configuration-file',
            dirs: ['/usr/local/share/gadgetron/config/'],
            height: height/3, 
            row: '#configuration-row', 
            playButtonClickEvent: this.playButtonClickEvent,
            addButtonClickEvent: this.addButtonClickEvent,
            uploadButtonClickEvent: this.uploadButtonClickEvent,
            buttons: ['add', 'upload']
        });
        configurationFolderView.render(function(view){
            $('#dashboard-configuration').html(view.el);
        });

        // Render Dat/H5-Folder
        var datFolderView = new FolderView({ 
            title: 'DAT/H5-Data',  
            className: 'dat-file',
            dirs: [ config.upload_dir + '/dat/', config.upload_dir + '/h5/'],
            height: height/3,
            uploadButtonClickEvent: this.uploadButtonClickEvent
        });
        datFolderView.render(function(view){
            self.datFolderCollection = view.collection;
            $('#dashboard-dat').html(view.el);
        });

        // Render XSL-Folder
        var xslFolderView = new FolderView({ 
            title: 'XSL-Data',  
            className: 'xsl-file',
            dirs: [ config.upload_dir + '/xsl/'],
            height: height/3,
            uploadButtonClickEvent: this.uploadButtonClickEvent
        });
        xslFolderView.render(function(view){
            self.xslFolderCollection = view.collection;
            $('#dashboard-xsl').html(view.el);
        });

        // Render Result-Folder
        var resultFolderView = new FolderView({ 
            title: 'Result-Data',  
            className: 'result-file',
            dirs: [ config.result_dir + '/'],
            height: height/3,
            buttons: [],
            row: '#result-row'
        });
        resultFolderView.render(function(view){
            self.resultFolderCollection = view.collection;
            $('#dashboard-results').html(view.el);
        });
    },
    // handels upload button click event
    uploadButtonClickEvent: function(event){
        var type = $(event.target.parentNode).data('type');
        var title = 'Upload';
        var fileextension;
        switch (type) {
            case 'configuration-file':
                title = `Configuration ${title}`;
                fileextension = '.xml';
                break;
            case 'dat-file':
                title = `DAT/H5 ${title}`;
                fileextension = '.dat,.h5';
                break;
            case 'xsl-file':
                title = `XSL ${title}`;
                fileextension = '.xsl';
                break;
            default:
                break;
        }
        // opens upload dialog
        if(self.uploadDialog){
            self.uploadDialog.title = title;
            self.uploadDialog.fileextension = fileextension;
            self.uploadDialog.render();
        }
        else{
            self.uploadDialog = new UploadDialog({title, fileextension, uploadEvent: self.uploadEvent});
            self.uploadDialog.render();
        }
    },
    // handels add button click event
    addButtonClickEvent: function(event){
        // opens save dialog
        var saveDialog = new SaveDialog({title: 'Create new configuration', saveEvent: self.saveEvent});
        saveDialog.render();
    },
    // handles upload event
    uploadEvent: function(event){
        self.renderFolderViews();
    },
    // handels save event
    saveEvent: function(event, value){
        if(value){
            // check if value has xml extenstion
            var splittedFileName = value.split('.');
            if(splittedFileName.length > 1){
                if(splittedFileName.pop() != 'xml'){
                    return false;
                }
            }
            else{
                value = value + ".xml";
            }
            // search for configuration
            if(gadgetronStreamConfigurationGroup.where({name: value}).length > 0){
                $('#filename-group').addClass('has-error');
            }
            else{
                // create new configuration model
                var newConfiguration = new GadgetronStreamConfiguration();
                var fileName = newConfiguration.createModel(value)
                gadgetronStreamConfigurationGroup.add(newConfiguration);
                // redirect to new configuration
                self.redirectEvent('#gadgetronStreamConfiguration/' + fileName);
                $('#modal').modal('hide');
            }       
        }
        else{
            $('#filename-group').addClass('has-error');
        }  
    },
    // handles play button click event
    playButtonClickEvent: function(event, model){
        // show play dialog
        if(this.playView){
            this.playView.model = model;
            this.playView.datFolderCollection = self.datFolderCollection;
            this.playView.xslFolderCollection = self.xslFolderCollection;
            this.playView.uploadEvent = self.uploadEvent;
        }
        else{
            this.playView = new PlayView({model,
                datFolderCollection: self.datFolderCollection,
                xslFolderCollection: self.xslFolderCollection,
                uploadEvent: self.uploadEvent
            });
        }
        this.playView.render();
    },
    close: function(){
        this.remove();
        this.unbind();
    },
    onShow: function(){
        $(this.el).show();
    }
});

module.exports = Dashboard;