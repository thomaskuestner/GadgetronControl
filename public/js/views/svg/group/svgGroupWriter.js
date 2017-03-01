import Backbone from 'backbone';
import $ from 'jquery';
import SvgGroup from './svgGroup';
import IoView from './../../ioView';
import IoModel from './../../../models/ioModel';
var d3 = require('d3');

class SvgGroupWriter extends SvgGroup {
    constructor(model, gadgetLength, id, svgScalingFactor, changedEvent, container, containerSelectAll, rerenderCallback){
        super(model, gadgetLength, id, svgScalingFactor, changedEvent, container, containerSelectAll, rerenderCallback);
        this.idPrefix = "writer_";
        this.partialHeight = this.svgHeight/(this.length + 1);
        this.writerXPosition = (this.width + this.gapBetweenGroups)*(this.gadgetLength + 1);
    }

    // override: draw group
    DrawGroup(){
        var self = this;
        super.DrawGroup();
        this.group
            .attr('transform',function(data, index){
                return "translate(" +  self.writerXPosition + "," + (self.partialHeight*(index + 1) - self.height / 2) + ")";
            })
    }

    // override: draw container
    DrawContainer(){
        this.container
            .insert('rect','g')
            .attr('width', this.width + this.gapBetweenGroups - 3*this.gapBetweenGroups/4)
            .attr('height', this.svgHeight)
            .attr('x', (this.width + this.gapBetweenGroups) * (this.gadgetLength + 1)- this.gapBetweenGroups/4)
            .attr('y', 0)
            .style('fill-opacity', 0)
            .style('stroke','black')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '10 5');

        this.container.insert('text','rect')
            .attr('font-size', this.svgFontSize * 2)
            .attr('x', (this.width + this.gapBetweenGroups) * (this.gadgetLength + 1) - this.gapBetweenGroups/4 + this.textMargin)
            .attr('y', this.svgHeight - this.textMargin)
            .text('Writers');
    }
    
    // override: line between the group
    DrawLine(){
        var self = this;
        this.group.append('line')
            .attr('x1', 0)
            .attr('y1', this.height/2)
            .attr('x2', -this.gapBetweenGroups)
            .attr('y2', function(data, index){
                if(self.length % 2 === 1 && (index + 1) === ((self.length + 1)/2)){
                    return self.height / 2;
                }
                else if(index < (self.length / 2)){
                    return Math.abs(self.partialHeight * (index - ((self.length - 1) / 2))) + self.height / 2;
                }
                else{
                    return -(Math.abs(self.partialHeight * (index - ((self.length - 1) / 2))) - self.height / 2);
                }
            })
            .style('stroke','black')
            .style('stroke-width', 1);
    }

    // override: text inside the group
    DrawText(){
        super.DrawText();
        this.text.text(function(data){
                return data.classname[0];
            });
    }

    // override
    ClickEvent(data, self, id){
        var className = d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').attr("class");
        switch (className) {
            case 'edit':
                var io = new IoModel({
                    classname : data.classname[0],
                    dll : data.dll[0],
                    slot : data.slot[0],
                });

                self.ioView = new IoView({
                    type: 'writer',
                    action: 'none',
                    model: io,
                    savedEvent: function(event, model, type){
                        data.classname[0] = model.classname[0];
                        data.dll[0] = model.dll[0];
                        data.slot[0] = model.slot[0];
                    }
                });
                self.ioView.show();
                break;
            case 'move':
                break;
            case 'remove':
                var splitId = id.split('_');
                var group = splitId[0];
                var id = splitId[1];
                this.model.splice(id, 1);
                this.RerenderCallback(this.model);
                break;
            default:
                break;
        }
    }
}

module.exports = SvgGroupWriter;