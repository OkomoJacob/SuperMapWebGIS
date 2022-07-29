// Add basemap to webpage
var map, url = "http://localhost:8090/iserver/services/map-CadastralWorkSpace/rest/maps/CadastralMap";
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
		center: [36.83, -1.31],
		zoom: 15,
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
		key: 'AkOyUpgDCoz063AWW1WfHnxp5222UBdxLOp1XvRv0tuebQnr2S7UcZkiLgME7gX0', //obtain key from Microsoft.
		imagerySet: 'Aerial'
	})
});
map.addLayer(bingMapLayer);

var layer = new ol.layer.Tile({
	source: new ol.source.TileSuperMapRest({
		url: url,
		wrapX: true,
		cacheEnabled: false //To prevent iServer from storing cached files locally
	}),
	projection: 'EPSG:4326'
});
map.addLayer(layer);
map.addControl(new ol.supermap.control.ScaleLine());

/* Toggle Side bar */
function openNav() {
	document.getElementById("printForm").style.width = "250px";
	document.getElementById("main-side").style.marginRight = "250px";
}

function closeNav() {
	document.getElementById("printForm").style.width = "0px";
	document.getElementById("main-side").style.marginRight = "0px";
}

var loader = document.getElementById("preloader");
// Load Event
window.addEventListener("load", function(){
	loader.style.display = "none";
})