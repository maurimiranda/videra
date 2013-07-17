var map;
var wmsManager;
var layersMenu;

$(document).ready(function() {
  $.ajaxPrefilter( function( options ) {
    if ( options.crossDomain ) {
      options.url = "proxy.php?mode=native&url=" + encodeURIComponent(options.url);
      options.crossDomain = false;
    }
  });

  // Create a map in the "map" div
  map = L.map('map', {attributionControl: false}).setView([-35, -64], 4);

  // Create layers
  var sacc = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/gwc/service/wms?", {
    layers: 'argentina500k:argentina500k_satelital',
    format: 'image/png',
    transparent: true,
    attribution: "Instituto Gegráfico Nacional"
  });

  var argenmap = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/gwc/service/wms?", {
    layers: 'capabaseargenmap',
    format: 'image/png',
    transparent: true,
    attribution: "Instituto Gegráfico Nacional"
  });

  var minimap = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/gwc/service/wms?", {
    layers: 'capabaseargenmap',
    format: 'image/png',
    transparent: true,
    attribution: "Instituto Gegráfico Nacional"
  });  

  baseLayers = {
    "Capa Base SIG 250": argenmap,
    "Satelital SAC-C": sacc
  };

  overlays = {
  };

  // Add default layer
  argenmap.addTo(map);

  // Add controls
  layersMenu = L.control.layersMenu(baseLayers, overlays).addTo(map);
  L.control.mousePosition({emptyString: ''}).addTo(map);
  L.control.scale({imperial: false}).addTo(map);
  L.control.minimap(minimap).addTo(map);
  L.control.locate().addTo(map);

  // Create WMSManager object
  wmsManager = new WMSManager({
    sourcesContainer: $("#sources"), 
    layersContainer: $("#layers"),
    layersInfoContainer: $("#layer-info")
  });

  $("#add-layer-button").click(function () {
    $("#add-overlay").modal("hide");
    var layer = L.tileLayer.wms(wmsManager.getServer().url, {
      layers: wmsManager.getLayer().name,
      format: 'image/png',
      transparent: true,
      attribution: wmsManager.getServer().title
    });
    map.addLayer(layer);
    layersMenu.addOverlay(layer, wmsManager.getLayer().name);
  });

  $('a.dropdown-toggle, .dropdown-menu a').on('touchstart', function(e) {
    e.stopPropagation();
  });
});