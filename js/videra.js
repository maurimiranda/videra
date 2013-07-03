var map;
var baseLayers;
var overlayLayers;
var wmsSources;
var wmsLayers;
var selectedLayerName;
var selectedLayer;

$(document).ready(function() {
  $.ajaxPrefilter( function( options ) {
    if ( options.crossDomain ) {
      options.url = "proxy.php?mode=native&url=" + encodeURIComponent(options.url);
      options.crossDomain = false;
    }
  });

  createMap();
  loadServices();
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
    layerItem = $("<li />").attr("layer", title).append($("<a />").text(title));
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

function loadServices() {
  $.ajax({
    url: 'http://mapa.ign.gob.ar/idera.jquery/servicios_wms.json',
    dataType: "json",
    success: function (result) {
      wmsSources = result;
      sources = $("#sources");
      $.each(wmsSources, function (key, source) {
        sourceItem = $("<option />").val(key).text(source.title).attr('title', source.title);
        sourceItem.click(function () {
          loadLayers(wmsSources[this.value]);
        });
        sources.append(sourceItem);
      });
    }
  });
}

function loadLayers (source) {
  $("#layerInfo").html('');
  $("#addLayerButton").attr('disabled', true);
  layers = $("#layers");
  layers.html('');
  layers.attr('disabled', true);
  $.ajax({
      url:  source.url + "service=wms&request=GetCapabilities",
      dataType: "xml",
      success: function(result) {
        wmsLayers = result;
        $(wmsLayers).find("Layer").each(function () {
            if ($(this).children("Name").text() != '') {
              layerItem = $("<option />").val($(this).children("Name").text()).text($(this).children("Title").text()).attr('title', $(this).children("Title").text());
              layerItem.click(function () {
                selectedLayerName = this.value;
                selectedLayer = $(wmsLayers).find("Layer > Name:contains(" + selectedLayerName + ")").filter(function(){return $(this).text() == selectedLayerName;}).parent();
                loadLayerInfo();
                $("#addLayerButton").attr('disabled', false);
              });
              layers.append(layerItem);
            }
        });
        layers.attr('disabled', false);
      }
  });
}

function loadLayerInfo () {
  $("#layerInfo").html($(selectedLayer).children("Abstract").text());
}

function addOverlayLayer () {

}