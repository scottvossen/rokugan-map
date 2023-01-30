window.rokugan = window.rokugan || { };

$(document).ready(function() {

  // init data
  rokugan.data = rokugan.data || { };
  rokugan.data.domain = [400, 600];
  rokugan.data.clans = getJson("data/clans.json", false);
  rokugan.data.provinces = getJson("data/provinces.json", false);
  rokugan.data.locations = getJson("data/locations.json", false);
  rokugan.data.features = getJson("data/features.json", false);

  var $mapSection = $(".map-section");
  var $mapContainer = $(".map-container");
  var $detailPane = $(".detail-pane");
  var $offcanvas = $(".row-offcanvas");

  // helper methods
  var sizeMap = function() {
    // map size is driven by the width of the parent div and the data.domain
    var borderWidth = 0; // wood-border width

    var x = $mapContainer.width() + (2 * borderWidth);
    var y = x * (rokugan.data.domain[1] / rokugan.data.domain[0]);

    return [Math.floor(x), Math.floor(y)];
  };
  var resize = function() {
    var mapSize = sizeMap();
    rokugan.map.resize(mapSize[0], mapSize[1]);
    $detailPane.height($mapContainer.height());
  }
  var toggleOffcanvas = function () {
    $offcanvas.toggleClass('active');
    $('.show-details').toggleClass('active');
    $('.show-details-tab').toggleClass('hide');
  }
  var swipe = function(event, direction, distance, duration, fingerCount) {
    var offcanvasActive = $offcanvas.hasClass("active");
    if (offcanvasActive && direction == "right" || !offcanvasActive && direction == "left") {
      toggleOffcanvas();
    }
  }

  // build map
  var mapSize = sizeMap();
  rokugan.map = new Viscous.TerritoryMap.Manager({ data : rokugan.data });
  rokugan.map.draw({ width : mapSize[0], height : mapSize[1] });
  resize(); // Hack to fix bug where introduction of scrollbar messes with inital sizing

  // events
  $('#showTerrain').click(rokugan.map.toggleTerrain.bind(rokugan.map));
  $('#showMons').click(rokugan.map.toggleMons.bind(rokugan.map));
  $('#showMarkers').click(rokugan.map.toggleMarkers.bind(rokugan.map));
  $('#showLabels').click(rokugan.map.toggleLabels.bind(rokugan.map));
  $('[data-toggle="offcanvas"]').click(toggleOffcanvas);
  window.onresize = $.throttle(100, resize);
  $(".background-container").swipe({ 
    swipeLeft : swipe,
    swipeRight : swipe,
    excludedElements : $.fn.swipe.defaults.excludedElements + ", .map-container, .icon"
  });
});