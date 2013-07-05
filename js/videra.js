var map;
var baseLayers;
var overlayLayers;
var wmsSources;
var wmsLayers;
var selectedServer;
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

  $("#add-layer-button").click(function () {
    $("#add-overlay").modal("hide");
    addOverlayLayer();
  });

  $("#overlay-layers").sortable({items: "> li:not('.nav-header')"});
});

function createMap() {
  // Create a map in the "map" div
  map = L.map('map', {zoomsliderControl: false, attributionControl: false}).setView([-35, -64], 4);

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

  overlayLayers = {
    "Capa Base SIG 250": argenmap,
    "Satelital SAC-C": sac_c,
    "Capa Base SIG 250": argenmap,
    "Satelital SAC-C": sac_c
  };

  configOverlayLayersMenu();

  // Add default layer
  argenmap.addTo(map);

  // Add controls
  L.control.mousePosition({emptyString: ''}).addTo(map);
  L.control.scale({imperial: false}).addTo(map);
  L.control.minimap(minimap).addTo(map);
  L.control.locate().addTo(map);
  L.control.zoomslider().addTo(map);

  configBaseLayersMenu();
}

function configBaseLayersMenu() {
  var first = true;
  $.each(baseLayers, function (title, layer) {
    layerItem = $("<li />").attr("layer", title).append($("<a />").text(title));
    if (first) {
      layerItem.addClass('active');
      first = false;
    }
    layerItem.click(function () {
      $("#base-layers li").removeClass('active');
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
    $("#base-layers").append(layerItem);
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
          selectedServer = wmsSources[this.value];
          loadLayers();
        });
        sources.append(sourceItem);
      });
    }
  });
}

function loadLayers () {
  $("#layer-info").html('');
  $("#add-layer-button").attr('disabled', true);
  layers = $("#layers");
  layers.html('');
  layers.attr('disabled', true);
  $.ajax({
      url:  selectedServer.url + "service=wms&request=GetCapabilities",
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
                $("#add-layer-button").attr('disabled', false);
              });
              layers.append(layerItem);
            }
        });
        layers.attr('disabled', false);
      }
  });
}

function loadLayerInfo () {
  $("#layer-info").html($(selectedLayer).children("Abstract").text());
}

function addOverlayLayer () {
  var layer = L.tileLayer.wms(selectedServer.url, {
    layers: selectedLayerName,
    format: 'image/png',
    transparent: true,
    attribution: selectedServer.title
  });

  overlayLayers[$(selectedLayer).children("Title").text()] = layer;
  map.addLayer(layer);
  configOverlayLayersMenu();
}

function configOverlayLayersMenu () {
  $("#overlay-layers > li:not('.nav-header')").remove();
  $.each(overlayLayers, function (title, layer) {
    layerIcon = $("<i class='icon-remove-sign icon-large layer-icon' />");
    layerIcon.click(function () {
      removeOverlayLayer($(this).parent().parent().attr('layer'));
      $(this).parent().parent().remove();
    })
    layerItem = $("<li />").attr("layer", title).append($("<a />").text(title).append(layerIcon));
    if (map.hasLayer(layer)) {
      layerItem.addClass('active');
    }
    layerItem.click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        map.removeLayer(overlayLayers[$(this).attr("layer")]);
      } else {
        $(this).addClass('active');
        map.addLayer(overlayLayers[$(this).attr("layer")]);
      };
    });
    $("#overlay-layers").append(layerItem);
  });
}

function removeOverlayLayer(layer) {
  map.removeLayer(overlayLayers[layer]);
  delete overlayLayers[layer];
}