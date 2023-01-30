/*************************************************************************
 * Copyright ..
 *
 *************************************************************************
 * 
 * @title
 * Viscous.TerritoryMap.Map.js
 * 
 * @description
 * The map object will instantiate a new svg map object.
 * 
 * Required options:
 *  data : {
 *    clans : clans.json,
 *    provinces : provinces.json,
 *    locations : locations.json,
 *    features : features.json,
 *  }
 * 
 * @author
 * Scott Vossen
 *
 *************************************************************************/
// REQUIRES: d3.js and underscore.js

var Viscous = Viscous || { };
Viscous.TerritoryMap = Viscous.TerritoryMap || { };

Viscous.TerritoryMap.Map = function(options) {

  options = _.extend({
    container : ".map-container"
  }, options);

  var self = this;
  self.data = options.data;
  self.callbacks = options.callbacks;
  self.container = d3.select(options.container);
  self.svg = null;
  self.paths = options.paths;
  self.assets = options.assets;
};

_.extend(Viscous.TerritoryMap.Map.prototype, {  
  __defineFilters__ : function() {
    var self = this;
    var defs = self.svg.append("defs");
    var outerGlow = defs.append("filter")
      .attr("id","outerGlow");
      outerGlow.append("feColorMatrix")
        .attr("in","SourceGraphic")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0")
        .attr("result","mask");
      outerGlow.append("feMorphology")
        .attr("in","mask")
        .attr("radius","3")
        .attr("operator","dilate")
        .attr("result","mask");
      outerGlow.append("feColorMatrix")
        .attr("in","mask")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0.6   0 0 0 0 0.5333333333333333   0 0 0 0 0.5333333333333333   0 0 0 1 0")
        .attr("result","r0");
      outerGlow.append("feGaussianBlur")
        .attr("in","r0")
        .attr("stdDeviation","4")
        .attr("result","r1");
      outerGlow.append("feComposite")
        .attr("operator","out")
        .attr("in","r1")
        .attr("in2","mask")
        .attr("result","comp");
    var frMerge = outerGlow.append("feMerge");
      frMerge.append("feMergeNode")
        .attr("in","SourceGraphic");
      frMerge.append("feMergeNode")
        .attr("in","r1");

    var innerGlow = defs.append("filter")
      .attr("id","innerGlow");
      innerGlow.append("feColorMatrix")
        .attr("in","SourceGraphic")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 500 0")
        .attr("result","mask");
      innerGlow.append("feMorphology")
        .attr("in","mask")
        .attr("radius","1")
        .attr("operator","erode")
        .attr("result","r1");
      innerGlow.append("feGaussianBlur")
        .attr("in","r1")
        .attr("stdDeviation","4")
        .attr("result","r2");
      innerGlow.append("feColorMatrix")
        .attr("in","r2")
        .attr("type", "matrix")
        .attr("values", "1 0 0 0 0.5803921568627451 0 1 0 0 0.3607843137254902 0 0 1 0 0.10588235294117647 0 0 0 -1 1")
        .attr("result","r3");
      innerGlow.append("feComposite")
        .attr("operator","in")
        .attr("in","r3")
        .attr("in2","mask")
        .attr("result","comp");
    var frMerge = innerGlow.append("feMerge");
      frMerge.append("feMergeNode")
        .attr("in","SourceGraphic");
      frMerge.append("feMergeNode")
        .attr("in","comp");

    var dropShadow = defs.append('filter')
      .attr('id', "drop-shadow")
      .attr('y', "-75%")
      .attr('height', "250%")
      .attr('x', "-75%")
      .attr('width', "250%");
      dropShadow.append('feGaussianBlur')
        .attr("in","SourceAlpha")
        .attr("stdDeviation","1");
      dropShadow.append("feOffset")
        .attr("dx", ".75")
        .attr("dy", ".75")
        .attr("result","offsetblur");
    var feMerge = dropShadow.append("feMerge");
      feMerge.append("feMergeNode");
      feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");

    var mapBg = defs.append('pattern')
      .attr('id', 'mapBg')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', self.data.domain[0])
      .attr('height', self.data.domain[1])
      .append("image")
      .attr("xlink:href", self.assets.terrain)
      .attr('width', self.data.domain[0])
      .attr('height', self.data.domain[1]);
  },
  __loadBackground__ : function() {
    this.background = this.svg.append("path")
      .attr("d", this.data.features.border.data)
      .attr("class", "background");
  },
  __loadLand__ : function() {
    this.land = this.svg.append("path")
      .attr("d", this.data.features.land.data)
      .style("filter","url(#outerGlow)")
      .classed("land outer-glow hidden", true);

    this.land = this.svg.append("path")
      .attr("d", this.data.features.land.data)
      .style("filter","url(#innerGlow)")
      .classed("land inner-glow hidden", true);
  },
  __loadFeatures__ : function() {
    this.features = { };

    this.features.water = this.svg.selectAll("path.water")
      .data(this.data.features.water)
      .enter()
        .append("path")
        .classed("water hidden", true)
        .attr("d", function(d,i) { return d.data });
    // this.features.river = this.svg.selectAll("path.river")
    //  .classed("hidden", true);
  },
  __loadProvinces__ : function() {
    var self = this;

    this.provinceContainer = this.svg.append("g")
      .classed("province-container", true);
    this.provinces = this.provinceContainer.selectAll("g.province")
      .data(this.data.provinces)
      .enter()
        .append("g")
        .classed("province clickable", true)
        .on("click", function(d,i) {
          d3.select(this).moveToFront();
          self.select(this);
        })
        .on("dblclick", function(d,i) {
          var clan = _.findWhere(self.data.clans, { id: d.owner });
          self.selectClan(clan);
        });
    this.regions = this.provinces
      .append("path")
      .classed("overlay region", true)
      .attr("id", function(d, i) { return d.id })
      .attr("d", function(d, i) { return d.region.data; })
      .style("fill", function(d,i) {
        var clan = _.findWhere(self.data.clans, { id: d.owner });
        return (clan && clan.color) ? clan.color.primary : "";
      });
    this.regions.append("title")
      .text(function(d,i) { return d.name + " Province"; })
  },
  __loadLocation__ : function(options) {
    var self = this;
    options = options || { };
    options.labelOffset = options.labelOffset || [ 5, 5 ];

    var location = this.svg.selectAll(options.locationClass ? ".location." + options.locationClass : ".location")
      .data(options.data)
      .enter()
        .append("g")
        .classed(options.locationClass ? "location " + options.locationClass : "location", true)
        .on("click", function(d, i) {
          self.select(this);
        });

    // place label
    location.append("text")
      .classed("label no-select no-pointer-events", true)
      .text(function(d, i) { return d.name; })
      .classed("invisible", function(d, i) { return d.lblPos === 'none'})
      .attr("font-family", "AquilineTwoRegular")
      .attr("font-size", "6px")
      .attr("fill", "#544")
      .attr("x", function(d, i) { return d.pos[0] + options.labelOffset[0]; })
      .attr("y", function(d, i) { return d.pos[1] - options.labelOffset[1]; });
        
    // place marker
    if (options.marker) {
      location.append("image")
        .classed("marker clickable", true)
        .attr("xlink:href", options.marker.href)
        .attr("x", function(d, i) { return d.pos[0] - (options.marker.width / 2); })
        .attr("y", function(d, i) { return d.pos[1] - (options.marker.height / 2); })
        .attr("width", options.marker.width)
        .attr("height", options.marker.height)
        .attr("title", function(d,i) { return d.name + " " + d.type; });
    } else {
      location.append("circle")
        .classed("marker clickable", true)
        .attr("r", 2)
        .attr("fill", "black")
        .attr("cx", function(d, i) { return d.pos[0]; })
        .attr("cy", function(d, i) { return d.pos[1]; })
        .attr("title", function(d,i) { return d.name; });
    }
    
    return location;
  },
  __loadLocations__ : function() {
    var self = this;

    this.locations = { };
    this.locations.generic = this.__loadLocation__({
                                locationClass : "generic",
                                labelOffset : [ 3, 3 ],
                                data : this.data.locations.filter(function(d, i) { return d.type == "generic"; })
                              });
    this.locations.castles = this.__loadLocation__({
                                locationClass : "castle",
                                labelOffset : [ 5, 5 ],
                                marker : { href : this.assets.markers.castle, width : 14, height : 14 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "castle"; })
                              });
    this.locations.cities = this.__loadLocation__({
                                locationClass : "city",
                                labelOffset : [ 4, 4 ],
                                marker : {  href : this.assets.markers.city, width : 10, height : 10 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "city"; })
                              });
    this.locations.villages = this.__loadLocation__({
                                locationClass : "village",
                                labelOffset : [ 4, 4 ],
                                marker : { href : this.assets.markers.village, width : 10, height : 10  },
                                data : this.data.locations.filter(function(d, i) { return d.type == "village"; })
                              });
    this.locations.temples = this.__loadLocation__({
                                locationClass : "temple",
                                labelOffset : [ 4, 4 ],
                                marker : { href : this.assets.markers.temple, width : 12, height : 12 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "temple"; })
                              });
    this.locations.tower = this.__loadLocation__({
                                locationClass : "tower",
                                labelOffset : [ 4, 4 ],
                                marker : { href : this.assets.markers.tower, width : 12, height : 12 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "tower"; })
                              });
    this.locations.shrines = this.__loadLocation__({
                                locationClass : "shrine",
                                labelOffset : [ 4, 4 ],
                                marker : { href : this.assets.markers.shrine, width : 8, height : 8 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "shrine"; })
                              });
    this.locations.battles = this.__loadLocation__({
                                locationClass : "battle",
                                labelOffset : [ 5, 5 ],
                                marker : { href : this.assets.markers.battle, width : 12, height : 12 },
                                data : this.data.locations.filter(function(d, i) { return d.type == "battle"; })
                              });
  },
  __loadBorders__ : function() {
    this.land = this.svg.append("path")
      .attr("d", this.data.features.land.data)
      .attr("class", "land");

    this.border = this.svg.append("path")
      .attr("d", this.data.features.border.data)
      .attr("class", "border");
  },
  __loadMons__ : function() {
    var monLoc = this.paths.mons;
    this.mons = this.svg.selectAll("image.mon")
      .data(this.data.clans)
      .enter()
        .append("image")
          .classed("mon no-select no-pointer-events", true)
          .attr("data-clan", function(d) { return d.id; })
          .attr("xlink:href", function(d) { return d.mon ? monLoc + d.mon.src : ""; })
          .attr("opacity", "0.2")
          .attr("x", function(d) { return d.mon ? d.mon.pos[0] : 0; })
          .attr("y", function(d) { return d.mon ? d.mon.pos[1] : 0; })
          .attr("width", 64)
          .attr("height", 64);
  },
  draw : function(options) {

    var self = this;

    options = _.extend({
      width : 400,
      height : 800
    }, options);

    var xScale = d3.scale.linear()
      .domain([0, self.data.domain[0]])
      .range([0, options.width]);

    var yScale = d3.scale.linear()
      .domain([0, self.data.domain[1]])
      .range([options.height, 0]);

    var zoom = d3.behavior.zoom()
      .scaleExtent([1, 3])
      .x(xScale)
      .y(yScale);
    zoom.on("zoom", function() {
      var tx = Math.min(d3.event.translate[0], 0);
      tx = Math.max(tx, -(self.data.domain[0] * (d3.event.scale - 1)));

      var ty = Math.min(d3.event.translate[1], 0);
      ty = Math.max(ty, -(self.data.domain[1] * (d3.event.scale - 1)));
      
      zoom.translate([tx, ty]);
      self.svg.attr("transform", "translate(" + [tx, ty] + ")scale(" + d3.event.scale + ")");
    });

    self.svgElem = self.container.append("svg")
      .classed("map no-select", true)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", options.width)
      .attr("height", options.height)
      .attr("viewBox", "0 0 " + self.data.domain[0] + " " + self.data.domain[1])
    self.svg = self.svgElem.append("g")
        .call(zoom)
          .on("dblclick.zoom", null) // disable dblclick to zoom
        .append("g");

    self.__defineFilters__();
    self.__loadBackground__();
    self.__loadFeatures__();
    self.__loadLand__();
    self.__loadProvinces__();
    self.__loadBorders__();
    self.__loadLocations__();
    self.__loadMons__();
  },
  resize : function(width, height) {
    this.svgElem.attr("width", width).attr("height", height);
  },
  clearSelection : function() {
    this.provinces.classed("selected", false);

    for (var property in this.locations) {
      if (this.locations.hasOwnProperty(property)) {
        this.locations[property].classed("selected", false);
      }
    }
  },
  select : function(el) {
    this.clearSelection();
    d3.select(el).classed("selected", true);
    this.callbacks.onSelection(el.__data__);
  },
  selectClan : function(clan) {
    if (!clan) { return; }
    
    var self = this;
    self.clearSelection();
    
    // hightlight all clan regions
    var clanProvinces = _.filter(self.provinces[0], function(obj) {
      return obj.__data__.owner == clan.id;
    })
    d3.selectAll(clanProvinces)
      .moveToFront()
      .classed("selected", true);

    this.callbacks.onSelection(clan);
  },
  toggleLabels : function() {
    var labels = this.container.selectAll(".location text");
    if (!labels.empty()) {
      labels.classed("hidden", !labels.classed("hidden"));
    }
  },
  toggleMarkers : function() {
    // TODO: Bind toggle to turn off labels as well
    var markers = this.container.selectAll(".marker");
    if (!markers.empty()) {
      markers.classed("hidden", !markers.classed("hidden"));
    }
  },
  toggleMons : function() {
    var mons = this.container.selectAll(".mon");
    if (!mons.empty()) {
      mons.classed("hidden", !mons.classed("hidden"));
    }
  },
  toggleTerrain : function() {
    // toggle overlay class to adjust how regions are styled
    var regions = this.container.selectAll(".region");
    if (!regions.empty()) {
      regions.classed("overlay", !regions.classed("overlay"));
    }
    
    // toggle the plain map land effects
    var outerGlow = this.container.selectAll(".land.outer-glow");
    if (!outerGlow.empty()) {
      outerGlow.classed("hidden", !outerGlow.classed("hidden"));
    }    
    var innerGlow = this.container.selectAll(".land.inner-glow");
    if (!innerGlow.empty()) {
      innerGlow.classed("hidden", !innerGlow.classed("hidden"));
    }

    // toggle land/water features
    var background = this.container.select(".background");
    if(!background.empty()) {
      background.classed("hidden", !background.classed("hidden"));
    }
    var water = this.container.selectAll(".water")
    if(!water.empty()) {
      water.classed("hidden", !water.classed("hidden"));
    }
  }
});
