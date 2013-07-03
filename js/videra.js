var map;
var baseLayers;
var overlayLayers;
var layersControl;

$(document).ready(function() {
  createMap();
});

function createMap() {
  // Create a map in the "map" div
  map = L.map('map', {zoomsliderControl: false}).setView([-35, -64], 4);

  // Create layers
  var sac_c = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/gwc/service/wms?", {
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
    "Satelital SAC-C": sac_c
  };

  // Add default layer
  argenmap.addTo(map);

  // Add controls
  L.control.mousePosition({emptyString: ''}).addTo(map);
  L.control.scale({imperial: false}).addTo(map);
  L.control.minimap(minimap).addTo(map);
  L.control.locate().addTo(map);
  L.control.zoomslider().addTo(map);

  configBaseLayers();
}

function configBaseLayers() {
  var first = true;
  $.each(baseLayers, function (title, layer) {
    layerItem = $("<li layer='" + title + "'><a href='#'>" + title + "</a></li>");
    if (first) {
      layerItem.addClass('active');
      first = false;
    }
    layerItem.click(function () {
      $("#baseLayers li").removeClass('active');
      $(this).addClass('active');
      layerTitle = $(this).attr('layer');
      $.each(baseLayers, function (title, layer) {
        if (title == layerTitle) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      });
    });
    $("#baseLayers").append(layerItem);
  });
}