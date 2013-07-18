(function ($) {

var Server = Backbone.Model.extend({

});

var Servers = Backbone.Collection.extend({
  model: Server,
  url: 'http://mapa.ign.gob.ar/idera.jquery/servicios_wms.json',
  parse: function (response) {
    return _(response).map(function (v, k) {
      return _.extend({name: k}, v);
    });
  }
});

var Layer = Backbone.Model.extend({

});

var BaseLayers = Backbone.Collection.extend({

});

var OverlayLayers = Backbone.Collection.extend({

});

var MapView = Backbone.View.extend({
  el: "#map",

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

var ServersList = Backbone.View.extend({

  el: "#servers",

  initialize: function() {
     _.bindAll(this, 'render', 'addServer');
    this.servers = new Servers();
    this.servers.bind("add", this.addServer);
    this.servers.fetch();
  },

  render: function () {
  },

  addServer: function (server) {
    var option = new ServerOption({model: server});
    this.$el.append(option.render().el);
  }

});

var ServerOption = Backbone.View.extend({

  tagName: "option",
  template: _.template($("#servers-list-template").html()),

  events: {
    "click": "loadLayers"
  },

  initialize: function () {
  },

  render: function () {
    this.$el.html(this.template({name: this.model.get("name"), title: this.model.get("title")}));
    return this;
  },

  loadLayers: function () {
    console.log(this);
  }

});

var mapview = new MapView();
var servers = new ServersList();

})(jQuery);