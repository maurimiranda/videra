/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 * L.Control.LayersMenu is a customized version built for videra.
 */

L.Control.LayersMenu = L.Control.Layers.extend({
  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true
  },

  initialize: function (baseLayers, overlays, options) {
    L.setOptions(this, options);

    this._layers = {};
    this._lastZIndex = 0;
    this._handlingClick = false;

    for (var i in baseLayers) {
      this._addLayer(baseLayers[i], i);
    }

    for (i in overlays) {
      this._addLayer(overlays[i], i, true);
    }
  },

  onAdd: function (map) {
    this._initLayout();
    this._update();

    map
        .on('layeradd', this._onLayerChange, this)
        .on('layerremove', this._onLayerChange, this);

    return this._container;
  },

  onRemove: function (map) {
    map
        .off('layeradd', this._onLayerChange)
        .off('layerremove', this._onLayerChange);
  },

  addBaseLayer: function (layer, name) {
    this._addLayer(layer, name);
    this._update();
    return this;
  },

  addOverlay: function (layer, name) {
    this._addLayer(layer, name, true);
    this._update();
    return this;
  },

  removeLayer: function (layer) {
    var id = L.stamp(layer);
    delete this._layers[id];
    this._update();
    return this;
  },

  _initLayout: function () {
    this._container = L.DomUtil.create('div');
    this._baseLayersList = L.DomUtil.get('base-layers');
    this._overlaysList = L.DomUtil.get('overlays');
  },

  _addLayer: function (layer, name, overlay) {
    var id = L.stamp(layer);

    this._layers[id] = {
      layer: layer,
      name: name,
      overlay: overlay
    };

    if (this.options.autoZIndex && layer.setZIndex) {
      this._lastZIndex++;
      layer.setZIndex(this._lastZIndex);
    }
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

  _onLayerChange: function (e) {
    var obj = this._layers[L.stamp(e.layer)];

    if (!obj) { return; }

    if (!this._handlingClick) {
      this._update();
    }

    var type = obj.overlay ?
      (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
      (e.type === 'layeradd' ? 'baselayerchange' : null);

    if (type) {
      this._map.fire(type, obj);
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
      L.DomUtil.removeClass(item, 'active');
    } else {
      L.DomUtil.addClass(item, 'active');
      if (!obj.overlay) {
        items = item.parentNode.getElementsByTagName('li');
        for (var i = 0; i < items.length; ++i) {
          if (items[i] != item) {
            L.DomUtil.removeClass(items[i], 'active');
            this._map.removeLayer(this._layers[items[i].layerId].layer);
          }
        }    
      }
    }

    if (L.DomUtil.hasClass(item, 'active') && !this._map.hasLayer(obj.layer)) {
      this._map.addLayer(obj.layer);
    } else if (!L.DomUtil.hasClass(item, 'active') && this._map.hasLayer(obj.layer)) {
      this._map.removeLayer(obj.layer);
    }

    this._handlingClick = false;
  }

});

L.control.layersMenu = function (baseLayers, overlays, options) {
  return new L.Control.LayersMenu(baseLayers, overlays, options);
};