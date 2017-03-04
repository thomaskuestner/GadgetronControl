import Backbone from 'backbone';
import $ from 'jquery';

// model
import File from './../models/fileModel';
import GadgetModel from './../models/gadgetModel';
import IoModel from './../models/ioModel';
import GadgetronStreamConfiguration from './../models/gadgetronStreamConfigurationModel'

// Collection
import GadgetronStreamConfigurationCollection from './../collections/gadgetronStreamConfigurationCollection';
import FileCollection from './../collections/fileCollection';

// Views
import Dashboard from './../views/dashboard/dashboard';
import SettingsView from './../views/settings/settingsView';
import Configurations from './../views/dashboard/configurations';
import Ios from './../views/dashboard/ios';
import Gadgets from './../views/dashboard/gadgets';
import LogFilesView from './../views/dashboard/logFilesView';
import StatusView from './../views/statusView';
import GadgetronStreamConfigurationCollectionView from './../views/gadgetronStreamConfiguration/collectionView';
import GadgetronStreamConfigurationView from './../views/gadgetronStreamConfiguration/view';
import PlayView from './../views/playView';
import FolderView from './../views/folderView';
import GadgetView from './../views/gadgetView';
import IoView from './../views/ioView';
import SaveDialog from './../views/saveDialog';
import UnsavedChangesDialog from './../views/gadgetronStreamConfiguration/unsavedChangesDialog';

// Extra
import RegionManager from './../regionManager';
import config from './../../../config.json';

Backbone.$ = $;

var gadgetronStreamConfigurationGroup;
var gadgets;
var readers;
var writers;
var ioView;
var self;

var originalFn = Backbone.history.loadUrl;

// Prevent Routing if there are unsaved Changes
Backbone.history.loadUrl = function() {
    if(typeof self.gadgetronStreamConfigurationView !== 'undefined' && self.gadgetronStreamConfigurationView.unsavedChanges){
        var direction = window.location.hash;
        var previousFragment = Backbone.history.fragment;
        window.location.hash = '#' + previousFragment;
        var unsavedChangesDialog = new UnsavedChangesDialog({redirectEvent: self.redirectEvent, direction, gadgetronStreamConfigurationView: self.gadgetronStreamConfigurationView});
        unsavedChangesDialog.show();
    }
    else {
        return originalFn.apply(this, arguments);
    }
};

// Router
var Router = Backbone.Router.extend({
    constructor: function(data){
        self = this;
        this.height = window.innerHeight - 3 * $('nav').outerHeight() - 4 - 4 * 20;
        this.gadgetGroup = data.gadgets;
        this.readerGroup = data.readers;
        this.writerGroup = data.writers;
        this.logFilesView = data.logFilesView;
        gadgetronStreamConfigurationGroup = data.group;
        Backbone.Router.prototype.constructor.call(this, gadgetronStreamConfigurationGroup);
    },
    // all routes
    routes:{
        "": "index",
        "admin": "admin",
        "gadgetronStreamConfiguration/*name": "gadgetronStreamConfiguration",
        "trash": "trash",
        "logfile": "logfile",
        "settings": "settings"
    },
    // index/dashboard page
    index: function(){
        // view gadgetron status
        this.statusView = new StatusView();
        $('#status').html(this.statusView.render().el);

        // check if dashboard was rendered once
        if(typeof this.dashBoard === 'undefined'){
            this.dashBoard = new Dashboard({ collection: gadgetronStreamConfigurationGroup, redirectEvent: this.redirectEvent});
        }
        RegionManager.show(this.dashBoard);

        // Render Log-File Views
        if(typeof this.logFilesView === 'undefined'){
            this.logFilesView = new LogFilesView({ 
                title: 'Log-File',
                height: this.height/3
            });
        }
        else{
            this.logFilesView.height = this.height/3;
        }
        $('#dashboard-logfiles').html(this.logFilesView.render().el);
        var logDiv = document.getElementById("log");
        if(logDiv){
            logDiv.parentNode.scrollTop = logDiv.parentNode.scrollHeight;
        }

        // Render Readers
        readers = new Ios({ 
            title: 'Readers', 
            className: 'readers',
            type: 'reader',
            collection: this.readerGroup, 
            clickedEvent: this.clickedEvent, 
            height: this.height/3
        });
        $('#dashboard-readers').html(readers.render().el);

        // Render Gadgets
        gadgets = new Gadgets({ 
            title: 'Gadgets', 
            className: 'gadgets', 
            collection: this.gadgetGroup,
            clickedEvent: this.clickedEvent,
            height: this.height/3
        });
        $('#dashboard-gadgets').html(gadgets.render().el);

        // Render Writers
        writers = new Ios({ 
            title: 'Writers', 
            className: 'writers',
            type: 'writer',
            collection: this.writerGroup,
            clickedEvent: this.clickedEvent,
            height: this.height/3
        });
        $('#dashboard-writers').html(writers.render().el);
    },
    // event for redirect
    redirectEvent: function(url){
        self.navigate(url, {trigger: true});
    },
    // event play button was clicked
    playButtonClickEvent: function(event){
        // get Information for PlayView
        if(self.dashBoard){
            self.datFolderCollection = self.dashBoard.datFolderView.collection;
            self.xslFolderCollection = self.dashBoard.xslFolderView.collection;
            self.resultFolderCollection = self.dashBoard.resultFolderView.collection;
        }
        else{
            // if configuration file is loaded direct there are no information about the content of dat or xsl folderView
            self.datFolderCollection = new FileCollection();
            self.xslFolderCollection = new FileCollection();
        }
        var playView = new PlayView({
            model: self.gadgetronStreamConfiguration,
            datFolderCollection: self.datFolderCollection,
            xslFolderCollection: self.xslFolderCollection,
            resultFolderCollection: self.resultFolderCollection,
            redirectEvent: self.redirectEvent
        });
        playView.render();
    },
    // event save reader/writer button was clicked
    savedIoEvent: function(event, model, type){
        switch (type) {
            case 'reader':
                // add model to collection
                self.readerGroup.add(model.toJSON()); 
                break;
            case 'writer':
                // add model to collection
                self.writerGroup.add(model.toJSON());
                break;
            default:
                break;
        }
    },
    // handels click event
    clickedEvent: function(event){
        // get target from click event
        var target;
        if($(event.target).hasClass('btn')){
            target = $(event.target);
        }
        else if($(event.target.parentNode).hasClass('btn')){
            target = $(event.target.parentNode);
        }

        if(target){
            // switch case for different button types
            switch (target[0].id) {
                case 'add-button':
                    if(target.hasClass('gadgets')){
                        // create new gadget
                        var gadget = new GadgetModel();
                        // show gadget
                        this.gadgetView = new GadgetView({
                            model: gadget,
                            collection: self.gadgetGroup
                        });
                        this.gadgetView.show();
                    }
                    else if(target.hasClass('readers')){
                        // create new reader
                        var reader = new IoModel();
                        // show reader
                        ioView = new IoView({
                            savedEvent: self.savedIoEvent,
                            type: 'reader',
                            action: 'add',
                            model: reader
                        });  
                        ioView.show();
                    }
                    else if(target.hasClass('writers')){
                        // create new writer
                        var writer = new IoModel();
                        // show writer
                        ioView = new IoView({
                            savedEvent: self.savedIoEvent,
                            type: 'writer',
                            action: 'add',
                            model: writer
                        });  
                        ioView.show();
                    }
                    break;
                case 'edit-button':
                    var type = target.data('type');
                    // switch case for different type editing
                    switch (type) {
                        case 'gadget':
                            // get name from target and search it in collection
                            var gadget = self.gadgetGroup.where({name: target.data('name')})[0];
                            // get properties from gadget
                            var properties = gadget.get('properties');
                            // add on property for adding a new property
                            if(properties){
                                properties.push({
                                    name: new Array(""),
                                    value: new Array("")
                                });
                            }
                            // add a properties-field
                            else{
                                properties = new Array();
                                // add on property for adding a new property
                                properties.push({
                                    name: new Array(""),
                                    value: new Array("")
                                });
                            }
                            // set properties in gadget model
                            gadget.get('set', properties);
                            // show gadget
                            this.gadgetView = new GadgetView({
                                model: gadget, 
                                action: 'update'
                            });
                            this.gadgetView.show();
                            break;
                        default:
                            break;
                    }
                    break;
                case 'trash-button':
                    var type = target.data('type');
                    // switch case for trashing differnt types
                    switch (type) {
                        case 'gadget':
                            // get name from target and search it in collection
                            var gadget = self.gadgetGroup.where({name: target.data('name')})[0];
                            // trigger removing from database
                            gadget.removeFromDb(function(status){
                                if(status){
                                    // removing from gadget collection
                                    self.gadgetGroup.remove(gadget);
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    },
    // route for specific configuration
    // name: filename of specific configuration
    gadgetronStreamConfiguration: function(name){
        this.changed = false;
        // search for configuration in collection
        self.gadgetronStreamConfiguration = gadgetronStreamConfigurationGroup.where({name})[0];
        // only render view once
        if(typeof self.gadgetronStreamConfiguration !== 'undefined'){
            this.gadgetronStreamConfigurationView = new GadgetronStreamConfigurationView({
                model: self.gadgetronStreamConfiguration.clone(), 
                gadgetGroup: self.gadgetGroup, 
                readerGroup: self.readerGroup, 
                writerGroup: self.writerGroup, 
                playButtonClickEvent: this.playButtonClickEvent
            });
            // show configuration view
            RegionManager.show(this.gadgetronStreamConfigurationView);
        }
    },
    // route for trash view
    trash: function(){
        var height = window.innerHeight - 2 * $('nav').outerHeight() - 2;
        if(typeof this.trashView != 'undefined'){
            this.trashView.remove();
        }
        // Render trashView
        this.trashView = new FolderView({ 
            title: 'Trash-Data',  
            className: 'configuration-file',
            dirs: [ config.trash_dir ],
            height: height,
            row: '#trash-row', 
            buttons: ['trash'],
            trash: true
        });
        RegionManager.show(this.trashView);
    },
    // route for log-file view
    logfile: function(){
        var height = window.innerHeight - 2 * $('nav').outerHeight() - 2;
        // Render Log-File Views
        if(typeof this.logFilesView === 'undefined'){
            this.logFilesView = new LogFilesView({ 
                title: 'Log-File',
                height: height
            });
        }
        else{
            // unbind events otherwise they fire more then once
            this.logFilesView.unbind();
            this.logFilesView.undelegateEvents();
            this.logFilesView.socket.close();
            this.logFilesView = new LogFilesView({ 
                title: 'Log-File',
                height: height,
                content: this.logFilesView.content
            });
        }
        RegionManager.show(this.logFilesView); 
        var logDiv = document.getElementById("log");
        if(logDiv){
            logDiv.parentNode.scrollTop = logDiv.parentNode.scrollHeight;
        }
    },
    settings: function(){
        // Render settingsView
        this.settingsView = new SettingsView();
        RegionManager.show(this.settingsView);
    }
});

module.exports = Router;