/*************************************************************************
 * Copyright ..
 *
 *************************************************************************
 * 
 * @title
 * Viscous.TerritoryMap.Details.js
 * 
 * @description
 * The details object is a controller for the Details View.
 * 
 * Required options:
 *  none
 * 
 * @author
 * Scott Vossen
 *
 *************************************************************************/
// REQUIRES: d3.js and underscore.js

var Viscous = Viscous || { };
Viscous.TerritoryMap = Viscous.TerritoryMap || { };

Viscous.TerritoryMap.Details = function(options) {

  options = _.extend({
    container : ".detail-pane",
    head : {
      header : ".header",
      icons : ".icon-list",
      featuredIcon : ".featured-icon"
    },
    body : {
      title : ".title",
      content : ".content"
    }
  }, options);

  var self = this;
  self.data = options.data;
  self.callbacks = options.callbacks;
  self.container = d3.select(options.container);
  self.head = { 
    header : self.container.select(options.head.header),
    icons : self.container.select(options.head.icons),
    featuredIcon : self.container.select(options.head.featuredIcon)
  };
  self.body = {
    title : self.container.select(options.body.title),
    content : self.container.select(options.body.content)
  };
  self.paths = options.paths;
  self.assets = options.assets;
};

_.extend(Viscous.TerritoryMap.Details.prototype, {
  display : function(data) {

    if (!data) { return; }

    var self = this;
    data.details.background = data.details.background || this.assets.backgrounds.default;

    self.container.classed("invisible", false);
    self.head.icons.html("");
    self.head.featuredIcon.classed("hidden", true);
    // var clan;
    
    switch(data.details.type) {
      
      case "clan":
        self.head.featuredIcon
          .classed("hidden", false)
          .attr("src", data.details.icon || "")
          .attr("title", data.name + " Clan");
        break;

      case "province":
        var width = self.data.domain[0];
        var height = self.data.domain[1];
        //clan = _.findWhere(self.data.clans, { id: data.owner });

        // draw province into icon
        var icon = self.head.icons.append("li")
          .append("div")
            .classed("icon province", true)
            .attr("title", data.name + " Province");
        var regionSvg = icon.append("svg")
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .attr("width", 28)
          .attr("height", 28)
          .attr("viewBox", "0 0 " + self.data.domain[0] + " " + self.data.domain[1]);
        var region = regionSvg.append("path")
          .classed("region", true)
          .attr("d", data.region.data)
          .style("fill", (data.details.allegiance && data.details.allegiance.color) ? data.details.allegiance.color.primary : "#eda");

        var bbox = region[0][0].getBBox();
        var dx = bbox.width;
        var dy = bbox.height;
        var x = bbox.x + (bbox.width / 2);
        var y = bbox.y + (bbox.height / 2);
        var scale = .9 / Math.max(dx / width, dy / height);
        var translate = [(width / 2) - (scale * x), (height / 2) - (scale * y)];

        region.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        break;

      case "location":
        // if (data.owner) {
        //   clan = _.findWhere(self.data.clans, { id: data.owner });
        // } else {
        //   var province = _.findWhere(self.data.provinces, { id : data.provinceId });
        //   clan = _.findWhere(self.data.clans, { id: province.owner });
        // }

        self.head.icons.append("li")
          .append('div')
            .classed("icon location", true)
            .attr("title", data.name)
            .append("img")
              .attr("src", data.details.icon);
        break;

      default:
        break;
    }

    // append allegiance
    if (data.details.allegiance) {
      var allegianceIcon = self.head.icons.append("li").selectAll("div")
        .data([data.details.allegiance])
        .enter()
          .append('div')
            .classed("icon clickable allegiance", true)
            .attr("title", function(d,i) { return d.name + " Clan"; })
            .on("click", function(d,i) {
              self.callbacks.selectClan(d);
            });
        allegianceIcon
          .append("img")
            .attr("src", data.details.allegiance ? self.paths.mons + data.details.allegiance.mon.src : "");
    }
    
    self.head.header.style("background-image", "url(" + data.details.background + ")");
    self.head.header.style("height", self.head.header[0][0].offsetWidth * .6 + "px");
    self.body.title.text(data.details.title || "");
    self.body.content.html(data.details.html || "");

    self.container[0][0].scrollTop = 0;
  }
});
