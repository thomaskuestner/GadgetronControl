import Backbone from 'backbone';
import $ from 'jquery';
import GadgetronStreamRow from './row';

Backbone.$ = $;

var self;

// view for configuration collection
var GadgetronStreamCollectionView = Backbone.View.extend({
    tagName: 'table',
    className: 'table table-striped',
    template: `
    <thead>
        <tr>
            <th>Name</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody></tbody>`,
    render: function() {
        self = this;
        this.$el.html(this.template);
        // add for each element a row
        this.collection.each(this.addModel, this);
        return this;
    },
    addModel: function(row){
        // create configuration row
        var configurationRow = new GadgetronStreamRow({ model: row, deletedEvent: self.deletedEvent});
        this.$el.append(configurationRow.render().el);
    }
});

module.exports = GadgetronStreamCollectionView;