// Define global variables
var drawLine;
var drawPolygon;
var drawLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
})
map.addLayer(drawLayer);

// Measure linear distance on map
function measureDistance() {
	drawLine = new ol.interaction.Draw({
		source: drawLayer.getSource(),
		type: "LineString",
	});
	map.addInteraction(drawLine);

	// Callback event after drawline end is reached
	drawLine.on('drawend', function(evt) {
		console.log(evt);
		var distanceMeasureParam = new SuperMap.MeasureParameters(evt.feature.getGeometry());
		new ol.supermap.MeasureService(url, {
			measureMode: ""
		}).measureDistance(distanceMeasureParam, function(serviceResult) {
			console.log(serviceResult);
			widgets.alert.showAlert('Length: ' + serviceResult.result.distance.toFixed(3) + 'm', true);
		});
	});
}

function measureArea() {
	drawPolygon = new ol.interaction.Draw({
		source: drawLayer.getSource(),
		type: "Polygon"
	});
	map.addInteraction(drawPolygon);

	drawPolygon.on('drawend', function(evt) {
		console.log(evt);
		var distanceMeasureParam = new SuperMap.MeasureParameters(evt.feature.getGeometry());
		new ol.supermap.MeasureService(url, {
			measureMode: ""
		}).measureArea(distanceMeasureParam, function(serviceResult) {
			console.log(serviceResult);
			widgets.alert.showAlert('Area: ' + serviceResult.result.area.toFixed(2) + 'm²', true);
		});
	});
}

function clearDraw() {
	map.removeInteraction(drawLine);
	map.removeInteraction(drawPolygon);
	drawLayer.getSource().clear();
	map.removeInteraction(drawPoint);
	resultLayer.getSource().clear(); //clear early query result
	overlay.setPosition(undefined);
	map.removeOverlay(overlay);
	currentFeature = null;
	map.removeInteraction(modify);
	map.removeInteraction(snap);
	editLayer.getSource().clear();
}

function fullExtent() {
	map.setView(new ol.View({
		center: [36.80 , -1.31],
		zoom: 11.35,
		projection: 'EPSG:4326',
		multiWorld: false
	}));
}

var drawPoint;
var vectorSource = new ol.source.Vector({
	wrapX: false
});

// Highlight the feature under query
resultLayer = new ol.layer.Vector({
	source: vectorSource,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'red',
			width: 3
		}),
		fill: new ol.style.Fill({
			color: 'rgba(0, 0, 255, 0.1)'
		})
	})
});

map.addLayer(resultLayer);

// Pop up window to show the attributes of query result
var container = document.getElementById('popup'),
	content = document.getElementById('popup-content');
var overlay = new ol.Overlay(({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	},
	offset: [0, -20] // Move the pop-up container 20px above query point
}));

// Spatial Query function
function clickQuery() {
	drawPoint = new ol.interaction.Draw({
		source: drawLayer.getSource(),
		type: "Point"
	});
	map.addInteraction(drawPoint);

	drawPoint.on('drawend', function(evt) {
		clearDraw();

		var param = new SuperMap.QueryByGeometryParameters({
			queryParams: {
				name: "building@CadastralData"
			},
			geometry: evt.feature.values_.geometry
		});
		new ol.supermap.QueryService(url).queryByGeometry(param, function(serviceResult) {
			console.log(serviceResult);
			// Render result layer on the map.
			var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);
			vectorSource.addFeatures(features);
			
			/* Pop up window to show the attributes of query result */
			var feature = features[0]; // Obtain the 1st feature to query
			currentFeature = feature;
			var properties = feature.getProperties();
			// console.log(properties);

			/* Table to display pop-up spatial query results */
			var contentHTML = '<table class="table table-bordered">';

			$.each(properties, function(idx, obj) {
				if (idx != "geometry" && idx != "SmID" && idx != "SmUserID" && idx != "SmArea" && idx !=
					"SmPerimeter") {
					contentHTML += "<tr>";
					contentHTML += '<td>' + idx + '</td>';
					contentHTML += '<td><input type="text" class="form-control" id="' + idx + 'Input" value="' + obj +
						'" /></td>';
					contentHTML += "</tr>";
				}
			});
			contentHTML += "</table>";
			contentHTML +=
				'<button class="btn btn-primary" style="width:50%" id="edit" onclick="editGeometry()">Edit</button>';
			contentHTML +=
				'<button class="btn btn-primary" style="width:50%" id="submit" onclick="editTable()">Submit</button>';
			content.innerHTML = contentHTML;
			overlay.setPosition(evt.feature.values_.geometry.getCoordinates());
			map.addOverlay(overlay);
			// At end of query, assign
			// currentFeature = feature;

		});
	});
}

/* Search input */
function showInput(){
	$("#inputPannel").toggle();
	$("#keyWordsOptions").hide();
}

$("#keyWordsInput").bind("input propertychange", function() {
	clearDraw();
	// Query on key enter
	var inputValue = $("#keyWordsInput").val();
	console.log(inputValue);
	
	var param = new SuperMap.QueryBySQLParameters({
		queryParams: {
			name: "building@CadastralData",
			attributeFilter: "name LIKE '%" + inputValue + "%'" //Append % bf and after the keyWord
		}
	});
	console.log(param);
	new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {
		var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);
		vectorSource.addFeatures(features);
		
		$("#keyWordsOptions").show();
		$('#keyWordsTable').empty();
		var optionHTML = "";

		/*Loop as the query runs*/
		for (var i = 0; i < features.length; i++) {
			var text = features[i].values_.name;
			var value = features[i].values_.SmID;
			optionHTML += "<option value='" + value + "'>" + text + "</option>";
		}
		$("#keyWordsTable").append(optionHTML);
	});
});

$('#keyWordsTable').change(function() {
	clearDraw();
	var selectedID = $(this).val()[0];
	var param = new SuperMap.QueryBySQLParameters({
		queryParams: {
			name: "building@CadastralData",
			attributeFilter: "SmID = " + selectedID + ""
		}
	});
	new ol.supermap.QueryService(url).queryBySQL(param, function(serviceResult) {
		var features = (new ol.format.GeoJSON()).readFeatures(serviceResult.result.recordsets[0].features);
		vectorSource.addFeatures(features);
		var feature = features[0];
		currentFeature = feature;
		var properties = feature.getProperties();
		var contentHTML = '<table class="table table-bordered">';
		$.each(properties, function(idx, obj) {
			if (idx != "geometry" && idx != "SmID" && idx != "SmUserID" && idx != "SmArea" && idx !=
				"SmPerimeter") {
				contentHTML += "<tr>";
				contentHTML += '<td>' + idx + '</td>';
				contentHTML += '<td><input type="text" class="form-control" id="' + idx + 'Input" value="' + obj +
					'" /></td>';
				contentHTML += "</tr>";
			}
		});
		contentHTML += "</table>";
		// 
		contentHTML +=
			'<button class="btn btn-primary" style="width:45%" id="edit" onclick="editGeometry()">Edit</button>';
		contentHTML +=
			'<button class="btn btn-primary" style="width:45%" id="submit" onclick="editTable()">Submit</button>';
		content.innerHTML = contentHTML;
		
		var featureExtent = feature.values_.geometry.getExtent();
		var centerPoint = [(featureExtent[0] + featureExtent[2]) / 2, (featureExtent[1] + featureExtent[3]) / 2];
		
		overlay.setPosition(centerPoint);
		map.addOverlay(overlay);
		
		var featureView = new ol.View({
			center: centerPoint,
			zoom: 16,
			projection: 'EPSG:4326',
			multiWorld: true
		});
		map.setView(featureView);
	});
})

function openScene(){
	window.open("http://localhost:8090/iserver/services/map-CadastralWorkSpace/rest/maps/CadastralMap.ol3");
}
