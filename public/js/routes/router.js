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

// Router
var Router = Backbone.Router.extend({
    constructor: function(data){
        self = this;
        this.height = window.innerHeight - 3 * $('nav').outerHeight() - 4 - 4 * 20;
        this.gadgetGroup = data.gadgets;
        this.readerGroup = data.readers;
        this.writerGroup = data.writers;
        gadgetronStreamConfigurationGroup = data.group;
        Backbone.Router.prototype.constructor.call(this, gadgetronStreamConfigurationGroup);
    },
    // all routes
    routes:{
        "": "index",
        "admin": "admin",
        "gadgetronStreamConfiguration/:name": "gadgetronStreamConfiguration",
        "gadgetronStreamConfiguration/:name/:gadget": "gadgetronStreamConfiguration",
        "trash": "trash",
        "logfile": "logfile"
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
            this.logFilesView.unbind();
            this.logFilesView.undelegateEvents();
            this.logFilesView.socket.close();
            this.logFilesView = new LogFilesView({ 
                title: 'Log-File',
                height: this.height/3,
                content: this.logFilesView.content
            });
        }
        $('#dashboard-logfiles').html(this.logFilesView.render().el);

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
            redirectEvent: this.redirectEvent, 
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
            self.datFolderCollection = self.dashBoard.datFolderCollection;
            self.xslFolderCollection = self.dashBoard.xslFolderCollection;
        }
        else{
            // if configuration file is loaded direct there are no information about the content of dat or xsl folderView
            self.datFolderCollection = new FileCollection();
            self.xslFolderCollection = new FileCollection();
        }
        var playView = new PlayView({
            model: self.gadgetronStreamConfiguration,
            datFolderCollection: self.datFolderCollection,
            xslFolderCollection: self.xslFolderCollection
        });
        playView.render();
    },
    // event save gadget button was clicked
    savedGadgetEvent: function(event, model){
        // add model to collection
        self.gadgetGroup.add(model);
        gadgets.render();
    },
    // event save reader/writer button was clicked
    savedIoEvent: function(event, model, type){
        switch (type) {
            case 'reader':
                // add model to collection
                self.readerGroup.add(model);
                readers.render();      
                break;
            case 'writer':
                // add model to collection
                self.writerGroup.add(model);
                writers.render();
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
                            savedEvent: self.savedGadgetEvent
                        });
                        this.gadgetView.render();
                    }
                    else if(target.hasClass('readers')){
                        // create new reader
                        var reader = new IoModel();
                        // show reader
                        ioView = new IoView({savedEvent: self.savedIoEvent});
                        ioView.type = 'reader';
                        ioView.action = 'add';
                        ioView.model = reader;     
                        ioView.render();
                    }
                    else if(target.hasClass('writers')){
                        // create new writer
                        var writer = new IoModel();
                        // show writer
                        ioView = new IoView({savedEvent: self.savedIoEvent});
                        ioView.type = 'writer';
                        ioView.action = 'add';
                        ioView.model = writer;
                        ioView.render();
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
                                action: 'update', 
                                savedEvent: self.savedGadgetEvent
                            });
                            this.gadgetView.render();
                            break;
                        case 'reader':
                            // get classname from target and search it in collection
                            var io = self.readerGroup.where({classname: target.data('classname')})[0];
                            // show reader
                            ioView = new IoView({savedEvent: self.savedIoEvent});
                            ioView.type = 'reader';
                            ioView.model = io;
                            ioView.action = target.data('action');
                            ioView.render();
                            break;
                        case 'writer':
                            // get classname from target and search it in collection
                            var io = self.writerGroup.where({classname: target.data('classname')})[0];
                            // show writer
                            ioView = new IoView({savedEvent: self.savedIoEvent});      
                            ioView.type = 'writer';
                            ioView.model = io;
                            ioView.action = target.data('action');
                            ioView.render();  
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
                                    // render gadget view collection new
                                    gadgets.render();
                                }
                            });
                            break;
                        case 'reader':
                            // get classname from target and search it in collection
                            var reader = self.readerGroup.where({classname: target.data('classname')})[0];
                            // trigger removing from database
                            reader.removeFromDb('reader', function(status){
                                if(status){
                                    // removing from reader collection
                                    self.readerGroup.remove(reader);
                                    // render reader view collection new
                                    readers.render();
                                }
                            });
                            break;
                        case 'writer':
                            // get classname from target and search it in collection
                            var writer = self.writerGroup.where({classname: target.data('classname')})[0];
                            // trigger removing from database
                            writer.removeFromDb('writer', function(status){
                                if(status){
                                    // removing from writer collection
                                    self.writerGroup.remove(writer);
                                    // render writer view collection new
                                    writers.render(); 
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
        // search for configuration in collection
        self.gadgetronStreamConfiguration = gadgetronStreamConfigurationGroup.where({name})[0];
        // only render view once
        if(typeof this.gadgetronStreamConfigurationView === 'undefined'){
            this.gadgetronStreamConfigurationView = new GadgetronStreamConfigurationView({
                model: self.gadgetronStreamConfiguration, 
                gadgetGroup: self.gadgetGroup, 
                readerGroup: self.readerGroup, 
                writerGroup: self.writerGroup, 
                playButtonClickEvent: this.playButtonClickEvent
            });
        }
        else{
            this.gadgetronStreamConfigurationView.model = self.gadgetronStreamConfiguration;
            // save current configuration model (e.g. for play view)
        }
        // show configuration view
        RegionManager.show(this.gadgetronStreamConfigurationView);
    },
    // route for trash view
    trash: function(){
        // clear view
        $('#svg-region').addClass('hide');
        $('svg#svg-config').empty();
        $('svg#svg-preview').empty();
        $('#tool-bar').hide();
        var height = window.innerHeight - 2 * $('nav').outerHeight() - 2;
        if(typeof this.trashView === 'undefined'){
            // Render trashView
            this.trashView = new FolderView({ 
                title: 'Trash-Data',  
                className: 'configuration-file',
                dirs: [ config.trash_dir + '/' + config.upload_dir + '/dat/', config.trash_dir + '/' + config.upload_dir + '/h5/', config.trash_dir + '/' + config.upload_dir + '/xsl/', config.trash_dir + '/' + config.result_dir + '/'],
                height: height,
                buttons: [''],
                trash: true
            });
        }
        this.trashView.render(function(view){
            $('#main-region').html(view.el);
        });
    },
    // route for log-file view
    logfile: function(){
        // clear view
        $('#svg-region').addClass('hide');
        $('svg#svg-config').empty();
        $('svg#svg-preview').empty();
        $('#tool-bar').hide();
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
        $('#main-region').html(this.logFilesView.render().el);
    }
});

module.exports = Router;