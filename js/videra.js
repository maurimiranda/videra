var map;

$(document).ready(function() {
  createMap();
});

function createMap() {
  // Create a map in the "map" div
  map = L.map('map').setView([-35, -64], 4);

  // add layers
  var sac_c = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/wms?", {
    layers: 'argentina500k:argentina500k_satelital',
    format: 'image/png',
    transparent: true,
    attribution: "Instituto Gegráfico Nacional"
  });

  var argenmap = L.tileLayer.wms("http://wms.ign.gob.ar/geoserver/wms?", {
    layers: 'capabaseargenmap',
    format: 'image/png',
    transparent: true,
    attribution: "Instituto Gegráfico Nacional"
  });

  sac_c.addTo(map, true);
  argenmap.addTo(map);

  var baseLayers = {
    "Capa Base SIG 250": argenmap,
    "Satelital SAC-C": sac_c
  };

  // Add controls
  //L.control.layers(baseLayers).addTo(map);
  L.control.mousePosition({emptyString: ''}).addTo(map);
  L.control.scale({imperial: false}).addTo(map);
}
