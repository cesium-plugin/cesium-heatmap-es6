import { Cartesian3, Cartographic, Cesium3DTileset, Matrix4, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer, Math as CesiumMath, ArcGisMapServerImageryProvider, ArcGISTiledElevationTerrainProvider } from 'cesium';
import { useEffect } from 'react';
import { CesiumHeatmap, HeatmapPoint } from '../source';
import { Col, Row, Slider } from 'antd';

let cesiumHeatmap: CesiumHeatmap
const defaultDataValue: [number, number] = [10, 500]
const defaultOpacityValue: [number, number] = [0, 1]

const PHeatMap = (props: any) => {
    useEffect(() => {
        const viewer: Viewer = new Viewer('map', {
            imageryProvider: new ArcGisMapServerImageryProvider({ url: "https://elevation3d.arcgis.com/arcgis/rest/services/World_Imagery/MapServer" }),
            terrainProvider: new ArcGISTiledElevationTerrainProvider({
                url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
            }),
            infoBox: false,
            selectionIndicator: false,
            animation: false,
            timeline: false,
            baseLayerPicker: false
        })


        const _3DTileset = new Cesium3DTileset({
            url: 'http://resource.dvgis.cn/data/3dtiles/ljz/tileset.json'
        })
        _3DTileset.readyPromise.then(function (argument) {
            viewer.scene.primitives.add(_3DTileset)
            //贴地显示
            const height = 40
            const cartographic = Cartographic.fromCartesian(_3DTileset.boundingSphere.center);
            const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
            const offset = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height + height);
            const translation = Cartesian3.subtract(offset, surface, new Cartesian3());
            _3DTileset.modelMatrix = Matrix4.fromTranslation(translation);
            // viewer.flyTo(_3DTileset)
            const mouseClickHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            mouseClickHandler.setInputAction((e) => {
                const { position } = e
                const ray = viewer.camera.getPickRay(position);
                const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
                const radians = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
                const lat = CesiumMath.toDegrees(radians.latitude); //弧度转度
                const lng = CesiumMath.toDegrees(radians.longitude);
                const alt = radians.height;
                console.log(`longitude:${lng},latitude:${lat},height:${alt}`);
            }, ScreenSpaceEventType.LEFT_CLICK)
        })

        // const points: HeatMapPoint[] = [
        //     {
        //         longitude: 121.5014518384833,
        //         latitude: 31.23564006124199,
        //         value: 42.99642652631694,
        //     },
        //     {
        //         longitude: 121.48100097584987,
        //         latitude: 31.232386736176224,
        //         height: 25.683469294844425,
        //         value: 100
        //     },
        //     { longitude: 121.5163445091478, latitude: 31.263604790448436, value: 52.626351105611 }
        // ]
        const points: HeatmapPoint[] = []
        fetch("/datas/geojson/busstop2016.geojson", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => {
            response.json().then((data) => {
                if (data)
                    data.features.forEach(function (feature) {
                        const lon = feature.geometry.coordinates[0]
                        const lat = feature.geometry.coordinates[1]
                        points.push({
                            x: lon - 0.05,
                            y: lat - 0.04,
                            value: 100 * Math.random()
                        })
                    })
                cesiumHeatmap = new CesiumHeatmap(viewer,
                    {
                        zoomToLayer: true,
                        points,
                        heatmapDataOptions: { max: defaultDataValue[1], min: defaultDataValue[0] },
                        heatmapOptions: {
                            maxOpacity: defaultOpacityValue[1],
                            minOpacity: defaultOpacityValue[0]
                        }
                    }
                )

                // for (let i in points) {
                //     const point = points[i]
                //     const cartesian3 = Cartesian3.fromDegrees(point.longitude, point.latitude, 0)
                //     viewer.entities.add({
                //         position: cartesian3,
                //         point: {
                //             color: Color.RED,
                //             pixelSize: 4
                //         }
                //     })
                // }
            })
        })

    }, [])


    function onUpdate(value: [number, number]) {
        cesiumHeatmap.updateHeatMapMaxMin({
            min: value[0],
            max: value[1],
        })
    }

    function onUpdateOpacity(value: [number, number]) {
        cesiumHeatmap.updateHeatmap({
            minOpacity: value[0],
            maxOpacity: value[1],
        } as any)
    }

    return <div style={{ width: "100%", height: "100%", position: "relative" }} >
        <div style={{ width: "100%", height: "100%" }} id="map">

        </div>
        <Row style={{ position: "absolute", top: 0, left: 0, zIndex: 5000, backgroundColor: "#fff" }}>
            <Col style={{ padding: 10 }}>更新数据的值域:<Slider style={{ width: 200 }} min={0} max={1000} range defaultValue={defaultDataValue} onChange={onUpdate} /></Col>
            <Col style={{ padding: 10 }}>更新透明度:<Slider style={{ width: 200 }} step={0.1} min={0} max={1} range defaultValue={defaultOpacityValue} onChange={onUpdateOpacity} /></Col>
        </Row>
    </div>
}

export default PHeatMap