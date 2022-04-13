var currentFeature;
var dataUrl = "http://localhost:8090/iserver/services/data-Day1_Nairobi_Cadastral_Workspace/rest/data";

function editTable() {
	// console.log(currentFeature);
	/*Edit and update feature on map */
	$.each(currentFeature.values_, function(idx, obj) {
		if (idx != "geometry" && idx != "SmID" && idx != "SmUserID" && idx != "SmArea" && idx !=
			"SmPerimeter") {
			currentFeature.values_[idx] = $("#" + idx + "Input").val();
		}
	});

	console.log(currentFeature);
	var editFeatureParams = new SuperMap.EditFeaturesParameters({
		features: [currentFeature],
		dataSourceName: "CadastralData",
		dataSetName: "Nairobi_Buildings",
		editType: "update",
		returnContent: true
	});
	var editFeaturesService = new ol.supermap.FeatureService(dataUrl);
	editFeaturesService.editFeatures(editFeatureParams, function(serviceResult) {
		console.log(serviceResult);
		if (serviceResult.result.succeed) {
			alert("Modified successfully!");
			layer.getSource().refresh(); //refresh to later modify the feature
			clearDraw();
		}
	});
}
/* Edit by geometry*/
var editSource = new ol.source.Vector();
let editLayer = new ol.layer.Vector({
	source: editSource
});
var modify, snap;
map.addLayer(editLayer);

function editGeometry() {
	editLayer.getSource().clear();
	drawLayer.getSource().clear();
	resultLayer.getSource().clear();
	
	overlay.setOffset([0, overlay.getOffset()[1]-30]); //Double click "Edit" to move the infoWindow
	
	modify = new ol.interaction.Modify({
		source: editSource
	});
	map.addInteraction(modify);

	snap = new ol.interaction.Snap({
		source: editSource
	});
	map.addInteraction(snap);
	
	editSource.addFeatures([currentFeature]);
	
	modify.on('modifyend', function(evt) {
		currentFeature = evt.features.array_[0];
		console.log(currentFeature);
		console.log(currentFeature);
	});
}
/* Add a new building */
function drawBuilding(){
	var drawBuilding = new ol.interaction.Draw({
		source: drawLayer.getSource(),
		type: "Polygon"
	});
	map.addInteraction(drawBuilding);
	
	drawBuilding.on('drawend', function(evt) {
		map.removeInteraction(drawBuilding);
		var buildingGeometry = evt.feature.getGeometry();
		var buildingFeature = new ol.Feature(buildingGeometry);
		
		// Assign these 5 attributes to new building
		buildingFeature.values_.osm_id = $("#osm_id").val();
		buildingFeature.values_.code = $("#code").val();
		buildingFeature.values_.fclass = $("#fclass").val();
		buildingFeature.values_.name = $("#name").val();
		buildingFeature.values_.type = $("#type").val();
		console.log(buildingFeature);
		
		var addFeatureParams = new SuperMap.EditFeaturesParameters({
			features: [buildingFeature],
			dataSourceName: "CadastralData",
			dataSetName: "Nairobi_Buildings",
			editType: "add",
			returnContent: true
		});
		var editFeaturesService = new ol.supermap.FeatureService(dataUrl);
		editFeaturesService.editFeatures(addFeatureParams, function(serviceResult) {
			if (serviceResult.result.succeed) {
				alert("Add building successfully!");
				layer.getSource().refresh();
				clearDraw();
			}
		});
		
	});
}

/* Delete an existing building */
function deleteBuilding(){
	var deleteBuilding = new ol.interaction.Draw({
		source: drawLayer.getSource(),
		type: "Point"
	});
	map.addInteraction(deleteBuilding);
	
	deleteBuilding.on('drawend', function(evt) {
		map.removeInteraction(deleteBuilding);
		
		var param = new SuperMap.QueryByGeometryParameters({
			queryParams: {
				name: "Nairobi_Buildings@CadastralData"
			},
			geometry: evt.feature.values_.geometry
		});
		new ol.supermap.QueryService(url).queryByGeometry(param, function(serviceResult) {
			var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);
			vectorSource.addFeatures(features);
			//parseInt(features[0].values_)
			console.log();
			
			var deleteFeatureParams = new SuperMap.EditFeaturesParameters({
				IDs: [parseInt(features[0].values_.SmID)],
				dataSourceName: "CadastralData",
				dataSetName: "Nairobi_Buildings",
				editType: "delete",
				returnContent: true
			});
			var editFeaturesService = new ol.supermap.FeatureService(dataUrl);
			editFeaturesService.editFeatures(deleteFeatureParams, function(serviceResult) {
				if (serviceResult.result.succeed) {
					alert("Delete building successfully!");
					layer.getSource().refresh();
					clearDraw();
				}
			});
		});
	});
}
