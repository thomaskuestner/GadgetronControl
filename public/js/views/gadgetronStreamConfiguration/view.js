import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import ToolBarView from './../toolBarView';
import GadgetronStreamConfigurationSvg from './../svg/svg';
import Gadgets from './../gadgets';
import Ios from './../ios';
import SaveDialog from './../saveDialog';

Backbone.$ = $;

var svgConfig;
var self;
var gadgetGroup;
var readerGroup;
var writerGroup;
var saveDialog;

// view for configuration
var GadgetronStreamConfigurationView = Backbone.View.extend({
    initialize: function(attributes, options){
        gadgetGroup = attributes.gadgetGroup;
        readerGroup = attributes.readerGroup;
        writerGroup = attributes.writerGroup;
        this.playButtonClickEvent = attributes.playButtonClickEvent;
    },
    render: function(){
        self = this;
        // create svg preview
        var svgPreview = new GadgetronStreamConfigurationSvg(this.model, 'svg-preview', 4, null, null);
        svgPreview.Draw();
        // create svg
        svgConfig = new GadgetronStreamConfigurationSvg(this.model, 'svg-config', 1, function(transform){
            svgPreview.DrawVisibleRegion(transform);
        }, this.changedEvent, this.rerenderCallback);
        svgConfig.draggabel = true;
        svgConfig.margin = false;
        svgConfig.Draw();
        return this;
    },
    changedEvent: function(event){
        // some action
    },
    // handels reader selection event
    selectReaderEvent: function(event, reader){
        svgConfig.AppendReader(reader);
    },
    // handels gadget selection event
    selectGadgetEvent: function(event, gadget){
        svgConfig.AppendGadget(gadget);
    },
    // handels writer selection event
    selectWriterEvent: function(event, writer){
        svgConfig.AppendWriter(writer);
    },
    // rerender Callback function
    rerenderCallback: function(model){
        $('svg#svg-config').empty();
        $('svg#svg-preview').empty();
        self.render();
    },
    // handels toolbar click events
    toolBarClickedEvent: function(event){
        if($(event.currentTarget).hasClass('active-btn')){
            $(event.currentTarget).toggleClass('active');
        }
        switch (event.currentTarget.id) {
            // add reader to current configuration
            case 'add-reader-button':
                var readers = new Ios({collection: readerGroup, selectEvent: self.selectReaderEvent, type: 'reader', title: 'Reader'});
                readers.render();
                break;
            // add gadget to current configuration
            case 'add-gadget-button':
                var gadgets = new Gadgets({collection: gadgetGroup, selectGadgetEvent: self.selectGadgetEvent});
                gadgets.render();
                break;
            // add writer to current configuration
            case 'add-writer-button':
                var writers = new Ios({collection: writerGroup, selectEvent: self.selectWriterEvent, type: 'writer', title: 'Writer'});
                writers.render();
                break;
            // triggers save configuration
            case 'save-button':
                event.data.saveModel();
                break;
            // open save-as dialog and asks for filename
            case 'save-as-button':
                if(!saveDialog){                
                    saveDialog = new SaveDialog({saveEvent: self.saveEvent, data: event.data, title: 'Save as'});
                }
                saveDialog.data = event.data;
                saveDialog.render();
                break;
            // opens play view
            case 'play-button':                
                self.playButtonClickEvent(event);
                break;
            default:
                break;
        }
        svgConfig.ToolBarClickedEvent(event);
    },
    // handels save event
    saveEvent: function(event, value){
        if(value){
            if(this.data.saveModel(value)){
                $('#modal').modal('hide');
            }
            else{
                $('#filename-group').addClass('has-error');
            }         
        }
    },
    close: function(){
        $('#svg-region').addClass('hide');
        $('svg#svg-config').empty();
        $('svg#svg-preview').empty();
        $('#tool-bar').hide();
        this.remove();
        this.unbind();
    },
    // activate toolbar and show view
    onShow: function(){
        $('#svg-region').removeClass('hide'); 
        var toolBarView = new ToolBarView({model: this.model, toolBarClickedEvent: this.toolBarClickedEvent, template: '#tool-bar-config-entries'});        
        $('#tool-bar').html(toolBarView.render().el).slideDown(500);
        $(this.el).show();
    }
});


module.exports = GadgetronStreamConfigurationView;