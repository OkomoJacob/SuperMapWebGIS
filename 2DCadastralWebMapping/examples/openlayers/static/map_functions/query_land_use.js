/* Spatial query land use on map */
function queryLanduse() {
	// Obtain the landuse value from the landuseType id
	var selectedType = $('#landuseType').val();
	var param = new SuperMap.QueryBySQLParameters({
		queryParams: {
			name: "Nairobi_Buildings@CadastralData",
			attributeFilter: "fclass = '"+selectedType +"'"
		}
	});
	console.log(param);
	// Spatially query and highlight all features
	new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {
		var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);
		vectorSource.addFeatures(features);
	});
}
