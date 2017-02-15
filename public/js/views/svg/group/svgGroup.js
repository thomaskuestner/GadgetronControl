import Backbone from 'backbone';
import $ from 'jquery';
var d3 = require('d3');

class SvgGroup {
    constructor(model, gadgetLength, id, svgScalingFactor, changedEvent, container, containerSelectAll, RerenderCallback){
        this.id = id;
        this.model = model;
        this.gadgetLength = gadgetLength;
        this.changedEvent = changedEvent;
        this.RerenderCallback = RerenderCallback;
        this.svgScalingFactor = svgScalingFactor;
        this.containerSelectAll = containerSelectAll;
        this.container = container;
        this.svgWidth = (window.innerWidth) / this.svgScalingFactor;
        this.svgHeight = (window.innerHeight - 2 * $('nav').outerHeight()) / this.svgScalingFactor;
        this.length = this.model.length;
        this.partialWidth = (this.svgWidth / (this.gadgetLength + 2));
        this.width = this.partialWidth * 0.8;
        this.height = this.width / 2;
        this.gapBetweenGroups = this.partialWidth * 0.2;
        this.svgFontSize = this.height * 0.1;
        this.textXPosition = this.width * 0.03;
        this.middleCoordinates = this.svgHeight / 2;
        this.textMargin = 5;
    }

    Draw(){
        var self = this;

        this.DrawGroup();

        this.DrawContainer();

        this.DrawLine();

        this.DrawText();

        this.DrawRectangle();
    }

    // draw group
    DrawGroup(){
        var self = this;
        this.group = this.containerSelectAll
            .data(this.model)
            .enter()
            .append('g')
            .on('click', function(data, index){
                self.ClickEvent(data, self, self.idPrefix + index);
            })
            .attr('id', function(data, index){
                return self.idPrefix + index;
            })
            .on('mouseover', function(data,index){
                self.MouseOverEvent(data, self, self.idPrefix + index);
                self.ToggleSelection(true, self, self.idPrefix + index, data);
            })
            .on('mouseout', function(data,index){
                self.ToggleSelection(false, self, self.idPrefix + index, data);
            })
            .call(d3.drag()
                .on("start", function(data, index){
                    self.DragStartEvent(data, self, self.idPrefix + index, index);
                })
                .on("drag", function(data,index){
                    self.DragEvent(data, self, self.idPrefix + index);
                })
                .on("end", function(data, index){
                    self.DragEndEvent(data, self, self.idPrefix + index, index);
                })
            )
                        
        // adds link to properties settings
        this.containerSelectAll.append('a');
    }

    // rectangle around the group
    DrawRectangle(){
        this.rectangle = this.group.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('fill-opacity', 0)
            .style('stroke','black')
            .style('stroke-width', 1)
            .classed('edit', true);
    }
    
    // text inside the group
    DrawText(){
        this.text = this.group.append('text')
            .attr('font-size', this.svgFontSize)
            .attr('x', this.textXPosition)
            .attr('y', this.height/2 + this.svgFontSize/2);
    }

    ChangeRectangleStyle(attribute, value){
        this.rectangle.style(attribute, value);
    }

    ToggleRectangleClass(className, state){
        this.rectangle.classed(className, state);
    }

    ClickEvent(data, self, id){
        // has to be implemented
    }

    MouseOverEvent(data, self, id){
        // has to be implemented
    }

    DragStartEvent(data, self, id, index){
        // has to be implemented
    }

    DragEvent(data, self, id){
        // has to be implemented
    }

    DragEndEvent(data, self, id, index){
        // has to be implemented
    }

    ToggleSelection(state, self, id, data){
        if(state){
            d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').style('stroke-width', 5);
        }
        else{
            d3.select('svg#' + self.id).select('g#' + id).selectAll('rect').style('stroke-width', 1);
        }
    }
}

module.exports = SvgGroup;