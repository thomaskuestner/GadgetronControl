import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Views
import Row from './row';

// Models
import File from './../models/fileModel';

// Collection
import FileCollection from './../collections/fileCollection';

Backbone.$ = $;
var jQuery = $;
window.$ = window.jQuery = jQuery;

jQuery.noConflict(true);

var FolderView = Backbone.View.extend({
    template: _.template($("#dashboard-template").html()),
    table: _.template($("#table").html()),
    initialize: function(attributes, options){
        var self = this;
        this.title = attributes.title;
        this.className = attributes.className;
        this.height = attributes.height + 'px';
        this.row = attributes.row;
        this.playButtonClickEvent = attributes.playButtonClickEvent;
        this.addButtonClickEvent = attributes.addButtonClickEvent;
        this.uploadButtonClickEvent = attributes.uploadButtonClickEvent;
        this.buttons = attributes.buttons || ['upload'];
        this.dirs = attributes.dirs;
        this.trash = attributes.trash || false;
        this.collection = new FileCollection();
        // read directories
        if(this.dirs){
            this.dirs.forEach(function(dir){
                Backbone.ajax({
                    url: "/api/getFolder",
                    data: {
                        folderPath: dir
                    },
                    success: function(data){
                        data.forEach(function(file){
                            var fileModel = new File({name: file, path: dir + file});
                            self.collection.add(fileModel);
                        }, this);
                    }
                });
            });
        }
        this.listenTo(this.collection,'add', this.renderFileRows);
        this.listenTo(this.collection,'remove', this.renderFileRows);
    },
    render: function() {
        var table = this.table({attribute: 'Name'});
        var dashboardTemplate = this.template({title: this.title, className: this.className, content: $(table).prop('outerHTML'), height: this.height, buttons: this.buttons});
        this.$el.html(dashboardTemplate);
        return this;
    },
    renderFileRows: function(){
        this.counter = 0;
        this.$el.find('tbody').empty();
        this.collection.forEach(this.addRow, this);
    },
    events: {
        'click': "clickEvent"
    },
    addRow: function(row){
        this.counter = this.counter + 1;
        if(this.counter > 5){
            if(this.$el){
                var row = new Row({model: row, row: this.row, clickEvent: this.clickEvent, parent: this});
                this.$el.find('tbody').append(row.render().el);
            }
        }
    },
    clickEvent: function(event, model, parent){
        var currentTarget;
        if($(event.originalEvent.target).hasClass('btn')){
            currentTarget = $(event.originalEvent.target);
        }
        else if($(event.originalEvent.target.parentNode).hasClass('btn')){
            currentTarget = $(event.originalEvent.target.parentNode);
        }
        if(currentTarget){
            switch (currentTarget[0].id) {
                case 'play-button':
                    if(parent){
                        parent.playButtonClickEvent(event, model);
                    }
                    break;
                case 'file-trash-button':
                    if(model){
                        if(parent.trash){
                            model.delete();
                        }
                        else{
                            model.toTrash();
                        }
                    }
                    break;
                case 'file-restore-button':
                    if(model){
                        model.restore();
                    }
                    break;
                case 'add-button':
                    this.addButtonClickEvent(event);
                    break;
                case 'upload-button':
                    this.uploadButtonClickEvent(event);
                    break;
                case 'trash-all-button':
                    this.collection.forEach(function(file){
                        file.delete();
                    });
                    break;
                case 'open-hdfview-button':
                    if(model){
                        Backbone.ajax({
                            url: "/api/startHdfView",
                            data: {
                                filePath: model.get('path')
                            }
                        })
                    }
                    break;
                default:
                    break;
            }
        }
    }
});

module.exports = FolderView;