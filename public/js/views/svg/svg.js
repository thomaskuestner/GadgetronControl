import Backbone from 'backbone';
import $ from 'jquery';
var d3 = require('d3');
import SvgGroupGadget from './group/svgGroupGadget'
import SvgGroupWriter from './group/svgGroupWriter'
import SvgGroupReader from './group/svgGroupReader'

var self;
var svg;

class GadgetronStreamConfigurationSvg {
    constructor(model, id, svgScalingFactor, zoomCallback, changedEvent, rerenderCallback, clickContextMenu){
        this.id = id;
        this.model = model;
        this.changedEvent = changedEvent;
        this.clickContextMenu = clickContextMenu;
        this.rerenderCallback = rerenderCallback;
        this.svgScalingFactor = svgScalingFactor;
        this.zoomCallback = zoomCallback;
        this.svgWidth = (window.innerWidth) / this.svgScalingFactor;
        // minus 4 because of 2 navbars with 1px border(top+bottom+top+bottom = 4px)
        this.svgHeight = (window.innerHeight - 2 * $('nav').outerHeight() - 4) / this.svgScalingFactor;
        this.draggabel = false;
        this.margin = true;
        
        // for new files this has to be done
        if(!this.model.get('configuration').gadgetronStreamConfiguration){
            this.model.get('configuration').gadgetronStreamConfiguration = {};
        }
        if(this.model.get('configuration').gadgetronStreamConfiguration.gadget){
            this.gadgetLength = this.model.get('configuration').gadgetronStreamConfiguration.gadget.length;
        }
        else{
            this.gadgetLength = 0;
        }
        if(this.model.get('configuration').gadgetronStreamConfiguration.writer){
            this.writerLength = this.model.get('configuration').gadgetronStreamConfiguration.writer.length;
        }
        else{
            this.writerLength = 0;
        }
        if(this.model.get('configuration').gadgetronStreamConfiguration.reader){
            this.readerLength = this.model.get('configuration').gadgetronStreamConfiguration.reader.length;
        }
        else{
            this.readerLength = 0;
        }

        this.minZoom = 0.5;
        this.maxZoom = 10;
    }

    Draw(){
        self = this;
        svg = d3.select('svg#' + this.id);

        svg.attr('viewBox', '0 0 ' + this.svgWidth + ' ' +  this.svgHeight)
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            .style('position', 'absolute')
            .selectAll('svg');

        // rectangle around the svg
        svg.append('rect')
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
            .style('fill','white')
            .style('fill-opacity', 1)
            .style('stroke', function(){
                if(self.margin){
                    return 'black';
                }
                return 'white';
            })
            .style('stroke-width', 1);
        this.container = svg.append('g');
        this.containerSelectAll = this.container.selectAll('g');

        svg.on("contextmenu", function(){
            var contextMenu = [
                {"title": "Add Reader", "icon": "import", "id": "add-reader-button"}, 
                {"title": "Add Gadget", "icon": "cog", "id": "add-gadget-button"}, 
                {"title": "Add Writer", "icon": "export", "id": "add-writer-button"}];

            d3.event.preventDefault();
            var position = d3.mouse(this);
            var menu = d3.select('#context-menu')
                .style('left', position[0] + "px")
                .style('top', position[1] + "px")
                .style('display', 'inline-block')
                .on('mouseleave', function() {
                    d3.select('#context-menu').style('display', 'none');
                });
            menu.selectAll('li')
                .data(contextMenu)
                .enter()
                .append('li')
                .html(function(data, index){
                    return `<a id="${data.id}"><i class="glyphicon glyphicon-${data.icon}" aria-hidden="true"></i> ${data.title}</a>`;
                })
                .on('click', function(data) {
                    self.clickContextMenu(data);
                    d3.select('#context-menu').style('display', 'none');
                });
        });

        if(this.draggabel){
            svg.call(d3.zoom()
                .scaleExtent([this.minZoom, this.maxZoom])
                .on("zoom", self.ZoomAndMove));
            
            svg.call(d3.zoom()
                .scaleExtent([this.minZoom, this.maxZoom])
                .on("zoom", self.ZoomAndMove));
        }
        
        if(this.readerLength){
            this.readers = new SvgGroupReader(this.model.get('configuration').gadgetronStreamConfiguration.reader, this.gadgetLength, this.id, this.svgScalingFactor, this.changedEvent, this.container, this.containerSelectAll, this.RerenderCallback);
            this.readers.Draw();
        }

        if(this.gadgetLength){
            this.gadgets = new SvgGroupGadget(this.model.get('configuration').gadgetronStreamConfiguration.gadget, this.gadgetLength, this.id, this.svgScalingFactor, this.changedEvent, this.container, this.containerSelectAll, this.RerenderCallback, this.RerenderGroupCallback);
            this.gadgets.Draw();
        }

        if(this.writerLength){
            this.writers = new SvgGroupWriter(this.model.get('configuration').gadgetronStreamConfiguration.writer, this.gadgetLength, this.id, this.svgScalingFactor, this.changedEvent, this.container, this.containerSelectAll, this.RerenderCallback);
            this.writers.Draw();
        }

        if(this.gadgets){
            this.container
                .attr('transform',"translate(" +  this.gadgets.gapBetweenGroups / 2 + ",0)");
        }
    }

    // Draw the red rectangle of the visible region when zoomed in
    DrawVisibleRegion(transform){
        if(this.visibleRectangle === undefined){
            this.visibleRectangle = this.container.append('rect')
                .attr('width', this.svgWidth)
                .attr('height', this.svgHeight)
                .style('fill-opacity', 0)
                .style('stroke','red')
                .style('stroke-width', 1);
        }
        else{
            this.visibleRectangle.attr('x', (transform.x / this.svgScalingFactor) * -1);
            this.visibleRectangle.attr('y', (transform.y / this.svgScalingFactor) * -1);
            var scaleFactor = 1 / transform.k;
            this.visibleRectangle.attr('transform', 'scale(' + scaleFactor + ')');
        }
    }

    ToolBarClickedEvent(event){
        self.lastEvent = event;
        if($(event.currentTarget).hasClass('active')){
            switch (event.currentTarget.id) {
                case 'remove-button':
                    self.lastClass = 'remove';
                    self.ToggleAllRectangleClasses('edit','remove');
                    break;
                case 'reorder-button':
                    self.lastClass = 'move';
                    if(this.gadgets){
                        this.gadgets.ToggleRectangleClass('edit', false);
                        this.gadgets.ToggleRectangleClass('move', true);
                    }
                    break;
                default:
                    break;
            }
        }
        else{
            self.ToggleAllRectangleClasses(self.lastClass,'edit');
        }
    }

    AppendReader(reader){
        if(!self.model.get('configuration').gadgetronStreamConfiguration.reader){
            self.model.get('configuration').gadgetronStreamConfiguration.reader = new Array();
        }
        self.model.get('configuration').gadgetronStreamConfiguration.reader.push(reader.convertModel());
        self.RerenderCallback();
    }

    AppendGadget(gadget){
        if(!self.model.get('configuration').gadgetronStreamConfiguration.gadget){
            self.model.get('configuration').gadgetronStreamConfiguration.gadget = new Array();
        }
        self.model.get('configuration').gadgetronStreamConfiguration.gadget.push(gadget.convertModel());
        self.RerenderCallback();
    }

    AppendWriter(writer){
        if(!self.model.get('configuration').gadgetronStreamConfiguration.writer){
            self.model.get('configuration').gadgetronStreamConfiguration.writer = new Array();
        }
        self.model.get('configuration').gadgetronStreamConfiguration.writer.push(writer.convertModel());
        self.RerenderCallback();
    }

    RerenderCallback(model){
        if($(self.lastEvent.currentTarget).hasClass('active-btn')){
            $(self.lastEvent.currentTarget).toggleClass('active');
        }
        self.rerenderCallback(model);
    }

    RerenderGroupCallback(groupGadget){
        self.changedEvent();
        groupGadget.group.remove();
        groupGadget.containerRect.remove();
        groupGadget.containerRectText.remove();
        self.gadgets = new SvgGroupGadget(self.model.get('configuration').gadgetronStreamConfiguration.gadget, self.gadgetLength, self.id, self.svgScalingFactor, self.changedEvent, self.container, self.containerSelectAll, self.RerenderCallback, self.RerenderGroupCallback);
        self.gadgets.Draw();
        self.gadgets.ToggleRectangleClass('edit', false);
        self.gadgets.ToggleRectangleClass('move', true);
    }

    ZoomAndMove(){
        self.zoomCallback(d3.event.transform);
        self.container.attr("transform", d3.event.transform);
    }

    ToggleAllRectangleClasses(currentClass, newClass){
        if(this.readers){
            this.readers.ToggleRectangleClass(currentClass, false);
            this.readers.ToggleRectangleClass(newClass, true);
        }
        if(this.gadgets){
            this.gadgets.ToggleRectangleClass(currentClass, false);
            this.gadgets.ToggleRectangleClass(newClass, true);
        }
        if(this.writers){
            this.writers.ToggleRectangleClass(currentClass, false);
            this.writers.ToggleRectangleClass(newClass, true);
        }
    }
}

module.exports = GadgetronStreamConfigurationSvg;