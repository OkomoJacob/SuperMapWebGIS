// Add basemap to webpage
var map, url = "http://localhost:8090/iserver/services/map-Day1_Nairobi_Cadastral_Workspace/rest/maps/Day1_Nairobi_Cadatral";
		map = new ol.Map({
			target: 'map',
			controls: ol.control.defaults({
				attributionOptions: {
					collapsed: false
				}
			})
				.extend([new ol.supermap.control.Logo()]),
			// onMapCreated
			view: new ol.View({
				center: [36.80 , -1.31],
				zoom: 11.35,
				projection: 'EPSG:4326',
				// Continous view of the global world map
				multiWorld: false
			})
		});
		//Define new bingMapLayer, and call it before the iServer service layer
		var bingMapLayer = new ol.layer.Tile({
			visible: true,
			preload: Infinity,
			source: new ol.source.BingMaps({
				key: 'AkOyUpgDCoz063AWW1WfHnxp5222UBdxLOp1XvRv0tuebQnr2S7UcZkiLgME7gX0',
				imagerySet: 'Aerial'
			})
		});
		map.addLayer(bingMapLayer);

		var layer = new ol.layer.Tile({
			source: new ol.source.TileSuperMapRest({
				url: url,
				wrapX: true,
				cacheEnabled: false
			}),
			projection: 'EPSG:4326'
		});
		map.addLayer(layer);
		map.addControl(new ol.supermap.control.ScaleLine());