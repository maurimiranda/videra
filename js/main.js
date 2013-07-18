(function ($) {

Server = new Backbone.Model.extend({
  
})

Layer = new Backbone.Model.extend({

});

MapView = Backbone.View.extend({
  
  el: $("#map"),
  
  initialize: function () {
    
    // Create a map in the "map" div
    var map = L.map('map', {attributionControl: false}).setView([-35, -64], 4);

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
    L.control.mousePosition({emptyString: ''}).addTo(map);
    L.control.scale({imperial: false}).addTo(map);
    L.control.minimap(minimap).addTo(map);
    L.control.locate().addTo(map);

    return this;
  }
});

var mapview = new MapView;

})(jQuery);