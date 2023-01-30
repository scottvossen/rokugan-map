/*************************************************************************
 * Copyright ..
 *
 *************************************************************************
 * 
 * @title
 * Viscous.TerritoryMap.Manager.js
 * 
 * @description
 * The manager object serves as a master detail controller.
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

Viscous.TerritoryMap.Manager = function(options) {

  var self = this;
  self.assets = options.assets;
  var imageBasePath = options.imageBasePath || "assets/images/";
  options = _.extend({
    paths : {
      images : imageBasePath,
      mons : imageBasePath + "mon/"
    },
    assets : {
      terrain : imageBasePath+ "terrain.jpg",
      markers : {
        battle : imageBasePath + "battle.png",
        castle : imageBasePath + "castle.png",
        city : imageBasePath + "castle-town.png",
        village : imageBasePath + "village.png",
        temple : imageBasePath + "temple.png",
        tower : imageBasePath + "tower.png",
        shrine : imageBasePath + "shrine.png"
      },
      backgrounds : {
        default : [ imageBasePath + "details-bg-default.jpg" ],
        defaultClan : [ imageBasePath + "details-bg-default-clan.jpg" ],
        defaultProvince : [
            imageBasePath + "details-bg-default-province-1.jpg",
            imageBasePath + "details-bg-default-province-2.jpg",
            imageBasePath + "details-bg-default-province-3.jpg",
            imageBasePath + "details-bg-default-province-4.jpg",
            imageBasePath + "details-bg-default-province-5.jpg"
          ],
        defaultLocation : [ 
            imageBasePath + "details-bg-default-location-1.jpg",
            imageBasePath + "details-bg-default-location-2.jpg",
            imageBasePath + "details-bg-default-location-3.jpg",
            imageBasePath + "details-bg-default-location-4.jpg"
          ],
        battle : [ 
            imageBasePath + "details-bg-battle-1.jpg",
            imageBasePath + "details-bg-battle-2.jpg",
            imageBasePath + "details-bg-battle-3.jpg"
          ],
        castle : [ imageBasePath + "details-bg-castle.jpg" ],
        city : [ 
            imageBasePath + "details-bg-city-1.jpg",
            imageBasePath + "details-bg-city-2.jpg",
            imageBasePath + "details-bg-city-3.jpg"
          ],
        village : [ imageBasePath + "details-bg-village.jpg" ],
        temple : [ imageBasePath + "details-bg-temple.jpg" ],
        tower : [ imageBasePath + "details-bg-tower.jpg" ],
        shrine : [ imageBasePath + "details-bg-shrine.jpg" ],
      },
      icons : {
        generic : imageBasePath + "details-icon-default-location.png"
      }
    },
    map : { 
      callbacks : {
        onSelection : self.onSelection.bind(this)
      }
    },
    details : {  
      callbacks : {
        selectClan : self.selectClan.bind(this)
      }
    }
  }, options);

  self.paths = options.paths;
  self.assets = options.assets;

  // init data
  self.data = options.data;
  self.data.features = options.data.features || { };
  self.data.features.border = _.findWhere(self.data.features, { id : "border" });
  self.data.features.land = _.findWhere(self.data.features, { type : "land" });
  self.data.features.region = _.where(self.data.features, { type : "region" });
  self.data.features.water = _.where(self.data.features, { type : "water" });
  self.data.features.river = _.where(self.data.features, { type : "river" });
  self.__prepData__();

  self.map = new Viscous.TerritoryMap.Map(_.extend(options.map, options));
  self.details = new Viscous.TerritoryMap.Details(_.extend(options.details, options));
};

_.extend(Viscous.TerritoryMap.Manager.prototype, {
  __getBgIndex__ : function(bgList, indexOffset) {
    if (indexOffset && bgList) {
      return bgList[indexOffset % bgList.length];
    }
    return 0;
  },
  __prepData__ : function() {
    var self = this;
    var count = 0;
    
    this.data.clans.forEach(function(d, i, array) {
      // populate details
      d.details = _.extend({
        type : "clan",
        background : self.assets.backgrounds.defaultClan,
        icon : d.mon ? self.paths.mons + d.mon.src : "",
        title : d.title || d.name + " Clan"
      }, d.details);
    });

    this.data.provinces.forEach(function(d, i, array) {
      // populate each province definition with its associated region data
      var region = _.findWhere(self.data.features.region, { id : d.regionId });
      delete d.regionId;
      d.region = region || { };

      // populate details
      var clan = _.findWhere(self.data.clans, { id : d.owner });
      d.details = _.extend({
        type : "province",
        allegiance : clan, //clan ? self.paths.mons + clan.mon.src : "",
        background : self.__getBgIndex__(self.assets.backgrounds.defaultProvince, ++count),
        title : d.title || d.name
      }, d.details);
    });

    this.data.locations.forEach(function(d, i, array) {
      // populate details
      var clan;
      if (d.owner) {
        clan = _.findWhere(self.data.clans, { id: d.owner });
      } else if (d.provinceId) {
        var province = _.findWhere(self.data.provinces, { id : d.provinceId });
        clan = _.findWhere(self.data.clans, { id: province.owner });
      }
      
      var bgVal;
      var iconVal;
      switch(d.type) {
        case "castle":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.castle, ++count);
          iconVal = self.assets.markers.castle;
          break;
        case "city":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.city, ++count);
          iconVal = self.assets.markers.city;
          break;
        case "village":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.village, ++count);
          iconVal = self.assets.markers.village;
          break;
        case "temple":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.temple, ++count);
          iconVal = self.assets.markers.temple;
          break;
        case "tower":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.tower, ++count);
          iconVal = self.assets.markers.tower;
          break;
        case "shrine":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.shrine, ++count);
          iconVal = self.assets.markers.shrine;
          break;
        case "battle":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.battle, ++count);
          iconVal = self.assets.markers.battle;
          break;
        case "generic":
          bgVal = self.__getBgIndex__(self.assets.backgrounds.defaultLocation, ++count);
          iconVal = self.assets.icons.generic;
        default:
          break;
      }

      d.details = _.extend({
        type : "location",
        allegiance : clan, //clan ? self.paths.mons + clan.mon.src : "",
        background : bgVal,
        icon : iconVal,
        title : d.title || d.name
      }, d.details);
    });
  },
  draw : function(options) {
    this.map.draw(options);
  },
  onSelection : function(data) {
    this.details.display(data);
  },
  selectClan : function(data) {
    this.map.selectClan(data);
  },
  resize : function(width, height) {
    this.map.resize(width, height);
  },
  toggleLabels : function() {
    this.map.toggleLabels();
  },
  toggleMarkers : function() {
    this.map.toggleMarkers();
  },
  toggleMons : function() {
    this.map.toggleMons();
  },
  toggleTerrain : function() {
    this.map.toggleTerrain();
  }
});
