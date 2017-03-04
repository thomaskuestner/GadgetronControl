import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

Backbone.$ = $;

// Extras
import GadgetronReader from './../../readGadgetronFiles'

// Configuration view
var DatabaseView = Backbone.View.extend({
    initialize: function(attributes, options){
        this.gadgetGroup = attributes.gadgetGroup;
        this.readerGroup = attributes.readerGroup;
        this.writerGroup = attributes.writerGroup;
    },
    events:{
        'click #refresh-database': 'refreshDatabase'
    },
    template: _.template($("#database-template").html()),
    render: function() {
        self = this;
        var databaseTemplate = this.template();
        this.$el.html(databaseTemplate);
        return this;
    },
    refreshDatabase: function(event){
        var self = this;
        Backbone.ajax({
            url: "/api/gadgetronStreamConfiguration",
            success: function(data){
                GadgetronReader.parseGadgetronStreamConfigurationXml(data, 0, function(group){
                    GadgetronReader.upgradeIos(group, self.writerGroup , 'writer');
                    GadgetronReader.upgradeIos(group, self.readerGroup , 'reader');
                    GadgetronReader.upgradeGadgets(group, self.gadgetGroup);
                });
            }
        });
    }
});

module.exports = DatabaseView;