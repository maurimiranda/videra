var WMSManager = Class.extend({
  
  init: function (options) {
    this._sourcesContainer = options.sourcesContainer;
    this._layersContainer = options.layersContainer;
    this._layerInfoContainer = options.layersInfoContainer;
    this._getServices();
  },

  getServer: function () {
    return this._server;
  },

  getLayer: function () {
    return this._layer;
  },

  _getServices: function () {
    $(this._sourcesContainer).attr('disabled', true);
    $.ajax({
      url: 'http://mapa.ign.gob.ar/idera.jquery/servicios_wms.json',
      dataType: "json",
      context: this,
      success: this._loadServices
    });
  },

  _loadServices: function (result) {
    this._wmsSources = result;
    for (var source in this._wmsSources) {
      sourceItem = $("<option />").val(source).text(this._wmsSources[source].title).attr('title', this._wmsSources[source].title);
      sourceItem.click(this, function (e) {
        e.data._server = e.data._wmsSources[this.value];
        e.data._getLayers();
      });
      $(this._sourcesContainer).append(sourceItem);
    };
    $(this._sourcesContainer).attr('disabled', false);
  },

  _getLayers: function () {
    $(this._layerInfoContainer).html('');
    $(this._layersContainer).html('');
    $(this._layersContainer).attr('disabled', true);
    $.ajax({
        url: this._server.url + "service=wms&request=GetCapabilities",
        dataType: "xml",
        context: this,
        success: this._loadLayers
    });
  },

  _loadLayers: function (result) {
    this._wmsLayers = $(result).find("Layer");
    for (var i = 0; i < this._wmsLayers.length; i++) {
      if ($(this._wmsLayers[i]).children("Name").text() != '') {
        layerItem = $("<option />").val($(this._wmsLayers[i]).children("Name").text()).text($(this._wmsLayers[i]).children("Title").text()).attr('title', $(this._wmsLayers[i]).children("Title").text());
        layerItem.click(this, function (e) {
          layerName = this.value;
          e.data._selectLayer($(e.data._wmsLayers).find("Layer > Name:contains(" + layerName + ")").filter(function(){return $(this).text() == layerName;}).parent());
          e.data._loadLayerInfo();
        });
        $(this._layersContainer).append(layerItem);
      }
    };
    $(this._layersContainer).attr('disabled', false);
  },

  _loadLayerInfo: function () {
    $(this._layerInfoContainer).html(this._layer.abstract);
  },

  _selectLayer: function (layer) {
    this._layer = {
      name: $(layer).children("Name").text(),
      abstract: $(layer).children("Abstract").text()
    };
  }
});