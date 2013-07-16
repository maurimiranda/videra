/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 * L.Control.LayersMenu is a customized version built for videra.
 */

L.Control.LayersMenu = L.Control.Layers.extend({
  
  _initLayout: function () {
    this._container = L.DomUtil.create('div');
    this._baseLayersList = L.DomUtil.get('base-layers');
    this._overlaysList = L.DomUtil.get('overlays');
  },

  _update: function () {
    if (!this._container) {
      return;
    }

    this._baseLayersList.innerHTML = '';
    this._overlaysList.innerHTML = '';

    var baseLayersPresent = false,
        overlaysPresent = false,
        i, obj;

    for (i in this._layers) {
      obj = this._layers[i];
      this._addItem(obj);
      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
    }
  },

  _addItem: function (obj) {
    var item = document.createElement('li'),
        text = document.createElement('a');

    text.innerHTML = obj.name;
    item.appendChild(text);

    item.layerId = L.stamp(obj.layer);
    
    if (obj.overlay || this._map.hasLayer(obj.layer)) {
      item.className = 'active';
    } 

    L.DomEvent.on(item, 'click', this._onItemClick, this);

    var container = obj.overlay ? this._overlaysList : this._baseLayersList;
    container.appendChild(item);

    return item;
  },

  _onItemClick: function (e) {
    var obj,
      item = e.currentTarget;

    this._handlingClick = true;

    obj = this._layers[item.layerId];

    if (L.DomUtil.hasClass(item, 'active')) {
      if (!obj.overlay) return;
      L.DomUtil.removeClass(item, 'active');
      this._map.removeLayer(obj.layer);
    } else {
      if (!obj.overlay) {
        items = item.parentNode.getElementsByTagName('li');
        for (var i = 0; i < items.length; ++i) {
          if (items[i] != item) {
            L.DomUtil.removeClass(items[i], 'active');
            this._map.removeLayer(this._layers[items[i].layerId].layer);
          }
        }    
      }
      L.DomUtil.addClass(item, 'active');
      this._map.addLayer(obj.layer);
    }
      
    this._handlingClick = false;
  }

});

L.control.layersMenu = function (baseLayers, overlays, options) {
  return new L.Control.LayersMenu(baseLayers, overlays, options);
};