var mapServices = angular.module('mapServices',['ngResource']);

mapServices.factory('mapManager',['$http','olHelpers','shared',function($http,olHelpers,shared){
    'use strict';
var mapManager = {
    geoLayer:{},
    features:{},
    organisationUnits:"",
    boundaryLayer:{},
    thematicLayers:[],
    thematicDx:{},
    analyticsObject:{},
    period:null,
    getOrganisationUnits:function(){
        var thematicLayerOne = mapManager.thematicLayers[0]
        mapManager.getPeriod(thematicLayerOne);
            var orgs = "";
        if(thematicLayerOne.rows){
            angular.forEach(thematicLayerOne.rows,function(rowValue){
                if(rowValue.dimension=="ou"){
                    angular.forEach(rowValue.items,function(itemValue){
                        orgs += itemValue.id+";";
                    });
                }
            });

                mapManager.organisationUnits = orgs.substring(0, orgs.length - 1);

        }
    },
    getPeriod:function(output){
            var period = "";
        angular.forEach(output.filters,function(periodValue){
            console.log(periodValue);
                angular.forEach(periodValue.items,function(value,index){
                            period += value.id+";";
                });
        });
            if(period.length>0){
                mapManager.period = period.substring(0, period.length - 1);
            }
    },
    separateLayers:function(output){
        mapManager.boundaryLayer = {};
        mapManager.thematicLayers = [];
        var mapLayers  = output.mapViews;

        angular.forEach(mapLayers,function(value){
            if(typeof value !="undefined"){
                if(value.layer=="boundary"){
                    mapManager.boundaryLayer = value;
                }else{
                    mapManager.thematicLayers.push(value);
                }
            }
        });
    },
    getDimensions:function(dataDimensionItems){
        var dimensionType = dataDimensionItems.dataDimensionItemType;

        if(dimensionType=="INDICATOR"){
            return dataDimensionItems.indicator.id;
        }else if(dimensionType=="AGGREGATE_DATA_ELEMENT"){
            return dataDimensionItems.dataElement.id;
        }
    }
    ,
    getMapLayerBoundaries:function(organisationUnits){
        var geoLayer = {"type":"FeatureCollection","features":[]};
            var url = "../../../api/geoFeatures.json?ou=ou:"+organisationUnits;

           var promise = $http({
               method:'GET',
               url:url,
               dataType:'json',
               cache:true,
               isModified:true
           }).success(
               function(data){
               angular.forEach(data,function(value){

                   if(value.na.indexOf("MOH - Tanzania")<0){
                       var feature = {
                           type:"GeoJSON",
                           id:"",
                           geometry:{
                               type:"",
                               coordinates:null
                           },
                           properties:{
                               code:"",
                               name:"",
                               level:"",
                               parent:"",
                               parentGraph:""
                           },style:""
                       }

                       if(value.ty==2){
                           feature.type = "Feature";
                           feature.geometry.type = "MultiPolygon";

                           feature.geometry.coordinates    = JSON.parse(value.co);
                           feature.properties.code         = null;
                           feature.properties.name         = value.na;
                           feature.properties.level        = value.le;
                           feature.properties.parent       = value.pi;
                           feature.properties.parentGraph  = value.pg;
                           feature.id  = value.id;
                           feature.style  = null;//mapManager.getStyle(feature);
                           geoLayer.features.push(feature);
                       }



                   }


                       });
                   mapManager.geoLayer = geoLayer;
               }
           );

            return promise;
    },
    getMapThematicData:function(){

        // use one thematic layer to render colors on map regions
        if(mapManager.thematicLayers.length>0){
            console.log(mapManager.thematicLayers);
            var thematicLayer = mapManager.thematicLayers[0];
            mapManager.thematicDx.name = thematicLayer.displayName;
            mapManager.thematicDx.id = mapManager.getDimensions(thematicLayer.dataDimensionItems[0]);
            console.log(thematicLayer);
            mapManager.getOrganisationUnits(thematicLayer);

        var analyticsUrl = "../../../api/analytics.json?dimension=ou:"+mapManager.organisationUnits+"&dimension=dx:"+mapManager.thematicDx.id+"&filter=pe:"+mapManager.period+"&displayProperty=NAME";


               var promise = $http({
                   method:'GET',
                   url:analyticsUrl,
                   dataType:'json',
                   cache:true,
                   isModified:true
               }).success(
                   function(data){
                       mapManager.analyticsObject = data.rows;
                   }
               );

                return promise;

        }

    },
    renderMapLayers:function(mapCenter){
    var layer = mapManager.thematicLayers[0];
                      var colorArray = mapManager.getColorArray(layer.colorLow,layer.colorHigh,layer.classes);
                      var valueIntervals = mapManager.getValueInterval(mapManager.analyticsObject,layer.classes);
                      var legend = mapManager.getLegend(colorArray,valueIntervals);

                      angular.forEach(mapManager.analyticsObject,function(value,index){
                          console.log(value);
                          console.log(mapManager.features);
                          var    layerOpacity = layer.opacity;
                          mapManager.features[value[1]] = {
                                  facility_id:value[1],
                                  opacity:layerOpacity,
                                  "color":mapManager.decideColor(value,legend),
                                  "facility":Math.floor(Math.random() * 256)
                                        };

                      });



           var boundaries =  {
                MapCenter: mapCenter,
                layers:[
                    {
                        "name": "OpenCycleMap",
                        "active": true,
                        "source": {
                            "type": "OSM",
                            "url": "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                            "attribution": "All maps &copy; <a href=\"http://www.opencyclemap.org/\">OpenCycleMap</a>"
                        },
                        "visible": true,
                        "opacity": 1
                    }
                    ,
                    {
                        name:'geojson',
                        visible: true,
                        opacity:8,
                        source: {
                            type: 'GeoJSON',
                            geojson: {
                                object: mapManager.geoLayer
                            }
                        },
                        style: mapManager.getStyle
                    }
                ],
                    defaults: {
                events: {
                    layers: [ 'mousemove', 'click']
                }
            }
            }
            return boundaries;
    },


    //pushMapViews:function(analyticsObject){
    //    var mapId = analyticsObject.id;
    //    var url = "/api/maps/"+mapId+".json?fields=*,columns[dimension,filter,items[id,displayName|rename(name)]],rows[dimension,filter,items[id,displayName|rename(name)]],filters[dimension,filter,items[id,displayName|rename(name)]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit,mapViews[*,columns[dimension,filter,items[id,displayName|rename(name)]],rows[dimension,filter,items[id,displayName|rename(name)]],filters[dimension,filter,items[id,displayName|rename(name)]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]&_dc=1455009241325";
    //
    //   var promise = $http({
    //       method:'GET',
    //       url:url,
    //       dataType:'json',
    //       cache:true,
    //       isModified:true
    //   }).success(
    //       function(data){
    //       }
    //   );
    //
    //    return promise;
    //},
    //prepareMapLayers:function(mapViews,orgunitChildren,dimensionItems){
    //    var Layers = [];
    //    var layerType = "";
    //    var level = null;
    //
    //    var geoUrl = "";
    //    var thematicUrl = "";
    //    var dimensionItems = "";
    //    var period = null;
    //    var thematicOrganisationUnits = "";
    //        angular.forEach(mapViews,function(view){
    //        layerType = view.layer;
    //        level = view.parentLevel+2;
    //
    //        if(layerType=="boundary"){
    //            var layer = {
    //                name:'',
    //                source: {
    //                    type: '',
    //                    geojson: {
    //                        object:''
    //                    }
    //                }
    //            };
    //            if(view.rows){
    //                var orgunitString = "";
    //                var count_user_orgunit = 0;
    //                angular.forEach(view.rows[0].items,function(item){
    //                    if((item.id=="USER_ORGUNIT"||item.id=="USER_ORGUNIT_CHILDREN")&&count_user_orgunit==0) {
    //
    //                        angular.forEach(orgunitChildren, function (children) {
    //                            orgunitString += children.id + ";";
    //                        });
    //
    //                    }
    //
    //                });
    //                orgunitString = orgunitString.substring(0, orgunitString.length - 1);
    //                geoUrl = "/api/geoFeatures.json?ou=ou:LEVEL-"+level+";"+orgunitString;
    //
    //
    //            }
    //        }
    //
    //        if(layerType.indexOf('thematic')>=0){
    //
    //            angular.forEach(view.dataDimensionItems,function(value){
    //                if(value.dataDimensionItemType=="INDICATOR"){
    //                    dimensionItems+=value.indicator.id+";";
    //                }
    //            });
    //            dimensionItems = dimensionItems.substring(0, dimensionItems.length - 1);
    //
    //            angular.forEach(view.rows,function(value){
    //                if(value.dimension=="ou"){
    //                    angular.forEach(value.items,function(valueOu){
    //                        if((valueOu.id=="USER_ORGUNIT"||valueOu.id=="USER_ORGUNIT_CHILDREN")&&count_user_orgunit==0){
    //                            count_user_orgunit++;
    //
    //                                angular.forEach(orgunitChildren,function(children){
    //                                    thematicOrganisationUnits+=children.id+";";
    //                                });
    //
    //
    //                        }
    //
    //                        if(valueOu.id!="USER_ORGUNIT_CHILDREN"&&valueOu.id!="USER_ORGUNIT"){
    //                            thematicOrganisationUnits+=valueOu.id+";";
    //                        }
    //
    //
    //                    });
    //                }
    //
    //
    //            });
    //            thematicOrganisationUnits = thematicOrganisationUnits.substring(0, thematicOrganisationUnits.length - 1);
    //
    //
    //            angular.forEach(view.filters,function(value){
    //                if(value.dimension=="pe"){
    //                    var pes = "";
    //                    angular.forEach(value.items,function(valueP){
    //                        pes+=valueP.id+";";
    //                    });
    //
    //                    period = pes.substring(0, pes.length - 1);
    //                }
    //            });
    //
    //        }
    //
    //
    //
    //        });
    //
    //    thematicUrl="../../analytics.json?dimension=ou:"+thematicOrganisationUnits+"&dimension=dx:"+dimensionItems+"&filter=pe:"+period+"&displayProperty=NAME"
    //    var response = $.when(
    //    $http({
    //        method:'GET',
    //        url:thematicUrl,
    //        dataType:'json',
    //        cache:true,
    //        isModified:true
    //    }),$http({
    //        method:'GET',
    //        url:geoUrl,
    //        dataType:'json',
    //        cache:true,
    //        isModified:true
    //    })
    //    )
    //    return response;
    //},
    //getAnalytics:function(){},
    getLayerProperties:function(value){

            var layers = {};

                layers.type = value.layer;
                layers.name = value.name;
                layers.ishidden = value.hidden;
                layers.showLlabel = value.labels;
                layers.label = {};
                layers.label.labelFontSize = value.labelFontSize;
                layers.label.labelFontStyle = value.labelFontStyle;
                layers.label.labelFontWeight = value.labelFontWeight;
                layers.opacity = value.opacity;
                layers.classes = value.classes;
                layers.colorHigh = value.colorHigh;
                layers.colorLow = value.colorLow;



        return layers;
    },
    //getGeoJson:function(data,thematicData,layerProperties,props){
    //            var legend = null;
    //            var geoLayer = {"type":"FeatureCollection","features":[]};
    //    var colorHigh = "";
    //            var layerOpacity = 0;
    //            angular.forEach(layerProperties,function(layer){
    //                if(layer.type.indexOf("thematic")>=0){
    //
    //                    var colorArray = mapManager.getColorArray(layer.colorLow,layer.colorHigh,layer.classes);
    //                    var valueIntervals = mapManager.getValueInterval(thematicData.rows,layer.classes);
    //                    legend = mapManager.getLegend(colorArray,valueIntervals);
    //
    //                    angular.forEach(thematicData.rows,function(value,index){
    //                        layerOpacity = layer.opacity;
    //                        mapManager.features[value[1]] = {
    //                            facility_id:value[1],
    //                            opacity:layerOpacity,
    //                            "color":mapManager.decideColor(value,legend),
    //                            "facility":Math.floor(Math.random() * 256)
    //                        };
    //
    //                    });
    //
    //                }
    //            });
    //            angular.forEach(data,function(value){
    //                var feature = {
    //                    type:"GeoJSON",
    //                    id:"",
    //                    geometry:{
    //                        type:"",
    //                        coordinates:null
    //                    },
    //                    properties:{
    //                        code:"",
    //                        name:"",
    //                        level:"",
    //                        parent:"",
    //                        parentGraph:""
    //                    },style:""
    //                }
    //
    //                    if(value.ty==2){
    //                        feature.type = "Feature";
    //                        feature.geometry.type = "MultiPolygon";
    //
    //                        feature.geometry.coordinates    = JSON.parse(value.co);
    //                        feature.properties.code         = null;
    //                        feature.properties.name         = value.na;
    //                        feature.properties.level        = value.le;
    //                        feature.properties.parent       = value.pi;
    //                        feature.properties.parentGraph  = value.pg;
    //                        feature.id  = value.id;
    //                        feature.style  = mapManager.getStyle(feature);
    //                        geoLayer.features.push(feature);
    //                    }
    //
    //
    //
    //
    //    });
    //
    //   var boundaries =  {
    //        Africa: {
    //            zoom: props.zoom,
    //                lat: props.latitude,
    //                lon: props.longitude
    //        },
    //       //mapquest: {
    //       //    source: {
    //       //        type: 'MapQuest',
    //       //        layer: 'sat'
    //       //    }
    //       //},
    //        layers:[
    //            //{
    //            //    "name": "OpenCycleMap",
    //            //    "active": true,
    //            //    "source": {
    //            //        "type": "OSM",
    //            //        "url": "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
    //            //        "attribution": "All maps &copy; <a href=\"http://www.opencyclemap.org/\">OpenCycleMap</a>"
    //            //    },
    //            //    "visible": true,
    //            //    "opacity": 1
    //            //}
    //            //,
    //            {
    //                name:'geojson',
    //                visible: true,
    //                opacity:layerOpacity,
    //                source: {
    //                    type: 'GeoJSON',
    //                    geojson: {
    //                        object: geoLayer
    //                    }
    //                },
    //                style: mapManager.getStyle
    //            }
    //        ],
    //            defaults: {
    //        events: {
    //            layers: [ 'mousemove', 'click']
    //        }
    //    }
    //    }
    //    return boundaries;
    //},
    getShared:function(){
        return shared;
    },
    //getUserOrgunit:function(){
    //        var response = $http({
    //            method:'GET',
    //            url:'/api/me/organisationUnits.json',
    //            dataType:'json',
    //            cache:true,
    //            isModified:true
    //        });
    //
    //    return response;
    //},
    getColorArray:function(low,high,interval){
        var startColor = new mapfish.ColorRgb(),
            endColor = new mapfish.ColorRgb()
        startColor.setFromHex(low);
        endColor.setFromHex(high);
        var colors = mapfish.ColorRgb.getColorsArrayByRgbInterpolation(startColor, endColor, interval);
        var resultArray = [];
        angular.forEach(colors,function(value,index){
            resultArray.push({class:index,color:value.toHexString()});
        })

        return resultArray;
    },
    getStyle:function(feature){
        var color = "";
        var featureId = "";
        if(feature.id){
            featureId =feature.id;

        }else{
            featureId = feature.getId();
        }

            color = mapManager.features[featureId].color;

        var style = olHelpers.createStyle({
            fill:{
                color:color,
                opacity:mapManager.features[featureId].opacity
            },
            stroke:{
                color:'#cccccc',
                width:1
            },
            text:  new ol.style.Text({
                textAlign: 'center',
                textBaseline: 'middle',
                font: 'Arial',
                //text: formatText(districtProperties[feature.getId()].name),
                fill: new ol.style.Fill({color: "#000000"}),
                stroke: new ol.style.Stroke({color: "#cccccc", width: 1}),
                offsetX: 0,
                offsetY: 0,
                rotation: 0
            })
        });
        return [ style ];

    },
    getValueInterval:function(rows,classes){
        var valueArray = []
        angular.forEach(rows,function(value,index){
            valueArray.push(Number(value[2]));
        });
        valueArray.sort(function(a, b){return a-b});
        console.log("SORTED VALUE ARRAY");
        console.log(valueArray);
        var interval = ((valueArray[valueArray.length-1]-valueArray[0])/classes).toFixed(0);
        //var interval = ((valueArray[valueArray.length-2]-valueArray[0])/classes).toFixed(0);

        var start = valueArray[0];
        var end = valueArray[valueArray.length-1];
            var p=0;
        var legendsClass = [];
        while(p<classes){
            legendsClass.push({id:p,color:"#",interval:start+" - "+(Number(start)+Number(interval)).toFixed(0)});
            start= (Number(start)+Number(interval)).toFixed(0);
            p++;
        }

        return legendsClass;
    },
    getLegend:function(colorArray,valueIntervals){
        angular.forEach(colorArray,function(value,index){
            valueIntervals[index].color = value.color;
        });

        return valueIntervals;
    },
    decideColor:function(objects,legend){
        console.log("LEGEND");
        console.log(legend);
        var color = "";
        var indicatorValue = toDecimal(objects[2]);
        angular.forEach(legend,function(value,index){
            console.log("LEGEND INTERVAL");

            var interval = (value.interval).split(" - ");
            console.log(interval);
            console.log(indicatorValue);
            console.log(Number(indicatorValue)-Number(interval[1]));
                if(Number(interval[0])<=Number(indicatorValue)&&Number(indicatorValue)<Number(interval[1])){
                    color    = value.color;
                    console.log(color);
                }
        });

        return color;
    }
};

    return mapManager;

    function toDecimal(base){

        if(base.indexOf("E")>=0){
            mapManager.organisationUnits = base.substring(0, base.indexOf("E"));
            var exponent = Number(base.substr(base.indexOf("E"),base.length-1));
            var newbase = Number(base.substring(0, base.indexOf("E")))*Math.pow(10,exponent);

            base = newbase;
        }

        return base;
    }
}]);

mapServices.factory('shared',function(){
    var shared = {facility:0};
    return shared;

});
