import Backbone from 'backbone';
import $ from 'jquery';
import SvgGroup from './svgGroup';
import GadgetModel from './../../../models/gadgetModel';
import GadgetView from './../../../views/gadgetView';
var d3 = require('d3');

class SvgGroupGadget extends SvgGroup {
    constructor(model, gadgetLength, id, svgScalingFactor, changedEvent, container, containerSelectAll, rerenderCallback, RerenderGroupCallback){
        super(model, gadgetLength, id, svgScalingFactor, changedEvent, container, containerSelectAll, rerenderCallback);
        this.RerenderGroupCallback = RerenderGroupCallback;
        this.idPrefix = "gadget_";
    }

    // override: draw group
    DrawGroup(){
        var self = this;
        super.DrawGroup();
        this.group
            .attr('transform',function(data, index){                    
                index++;
                return "translate(" +  (self.width + self.gapBetweenGroups)*index + "," + (self.middleCoordinates - self.height / 2)+ ")";
            })
    }

    // override: draw container
    DrawContainer(){
        this.containerRect = this.container
            .insert('rect','g')
            .attr('width', (this.width + this.gapBetweenGroups) * this.gadgetLength - this.gapBetweenGroups/2)
            .attr('height', this.svgHeight)
            .attr('x', this.width + 3*this.gapBetweenGroups/4)
            .attr('y', 0)
            .style('fill-opacity', 0)
            .style('stroke','black')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '10 5');

        this.containerRectText = this.container.insert('text','rect')
            .attr('font-size', this.svgFontSize * 2)
            .attr('x', this.width + 3*this.gapBetweenGroups/4 + this.textMargin)
            .attr('y', this.svgHeight - this.textMargin)
            .text('Gadgets');
    }

    // override: line between the group
    DrawLine(){
        var self = this;
        this.group.append('line')
            .attr('x1', this.width)
            .attr('y1', this.height/2)
            .attr('x2', this.width + this.gapBetweenGroups)
            .attr('y2', this.height/2)
            .style('stroke','black')
            .style('stroke-width', 1)
            .style('stroke-opacity', function(data,index){
                // hide last line because of writers line
                if(index === self.gadgetLength - 1 ){
                    return 0;
                }
                return 1;
            });
    }

    // override: rectangle around the group
    DrawRectangle(){
        super.DrawRectangle();
        this.rectangle.classed('edit', true);
    }

    // override: text inside the group
    DrawText(){
        super.DrawText();
        this.text.text(function(data){
                return data.name[0];
            });
    }

    // override
    ClickEvent(data, self, id){
        var className = d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').attr("class");
        switch (className) {
            case 'edit':
                var gadget = new GadgetModel({
                            name: data.name[0],
                            dll: data.dll[0],
                            classname: data.classname[0],
                            properties: data.property,
                        });
                this.gadgetView = new GadgetView({
                    model: gadget,
                    action: 'none',
                    renderPropertyTypes: true,
                    savedEvent: function(event, model){
                        data.name[0] = model.name[0];
                        data.classname[0] = model.classname[0];
                        data.dll[0] = model.dll[0];
                        data.property = model.property;
                    }
                });
                this.gadgetView.render();
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

    // drag start event
    DragStartEvent(data, self, id, index){
        var className = d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').attr("class");
        switch (className) {
            case 'move':
                this.currentXPosition = 0;
                this.moveGadget = 0;
            break;
        default:
            break;
        }
    }

    // drag event
    DragEvent(data, self, id){
        var className = d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').attr("class");
        switch (className) {
            case 'move':
                // get transform values
                var transform = d3.select('#' + id).attr('transform').split('(').pop().split(')').shift().split(',');
                // calulate new y value
                var y = parseFloat(transform.pop()) + d3.event.dy;
                // calulate new x value
                var x = parseFloat(transform.pop()) + d3.event.dx;
                // get current x position
                this.currentXPosition = this.currentXPosition + d3.event.dx;
                // calulate how much gadgets to move
                var shiftCount = parseInt((this.currentXPosition + this.width/2)/(this.gapBetweenGroups + this.width));
                // calculate how much gadgets to shift if the drag is finished
                if(Math.abs(this.currentXPosition) > this.gapBetweenGroups + this.width + this.width / 2){
                    this.moveGadget = shiftCount;
                }
                else{
                    this.moveGadget = 0;
                }
                // move the gadget to the new (x,y)-coordinates
                d3.select('#' + id).attr('transform', "translate(" + x + "," + y + ")");
            break;
        default:
            break;
        }
    }

    // drag end event
    DragEndEvent(data, self, id, index){
        var className = d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').attr("class");
        switch (className) {
            case 'move':
                // set values to new position in pipeline
                if(this.moveGadget != 0){
                    if((index == 0 && this.moveGadget) > 0 || index != 0){
                        this.model.splice(index + this.moveGadget, 0, this.model.splice(index, 1)[0]);
                    }
                    else{
                        d3.select('#' + id).attr('transform', "translate(" + (self.width + self.gapBetweenGroups)*(index + 1) + "," + (self.middleCoordinates - self.height / 2) + ")");
                    }
                }
                // set values to old positions in pipeline
                else{
                    d3.select('#' + id).attr('transform', "translate(" + (self.width + self.gapBetweenGroups)*(index + 1) + "," + (self.middleCoordinates - self.height / 2) + ")");
                }
                // start rerendering of all gadgets
                this.RerenderGroupCallback(this);
            break;
        default:
            break;
        }
    }

    // override
    ToggleSelection(state, self, id, data){
        if(state){
            d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').style('stroke-width', 5);
        }
        else{
            d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').style('stroke-width', 1);
        }
    }
}

module.exports = SvgGroupGadget;