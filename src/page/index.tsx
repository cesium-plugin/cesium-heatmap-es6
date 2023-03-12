import {
  Cartesian3,
  Cartographic,
  Cesium3DTileset,
  Matrix4,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  Math as CesiumMath,
  ArcGisMapServerImageryProvider,
  ArcGISTiledElevationTerrainProvider,
} from "cesium";
import { useEffect, useState } from "react";
import { CesiumHeatmap, HeatmapPoint } from "../source";
import { Button, Col, Row, Slider } from "antd";

let cesiumHeatmap: CesiumHeatmap;
const defaultDataValue: [number, number] = [10, 200];
const defaultOpacityValue: [number, number] = [0, 1];
const defaultRadius = 20;
const PHeatMap = (props: any) => {
  const [radius, setRadius] = useState(defaultRadius);

  useEffect(() => {
    const viewer: Viewer = new Viewer("map", {
      imageryProvider: new ArcGisMapServerImageryProvider({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/World_Imagery/MapServer",
      }),
      terrainProvider: new ArcGISTiledElevationTerrainProvider({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
      }),
      infoBox: false,
      selectionIndicator: false,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
    });

    const _3DTileset = new Cesium3DTileset({
      url: "http://resource.dvgis.cn/data/3dtiles/ljz/tileset.json",
    });
    _3DTileset.readyPromise.then(function (argument) {
      viewer.scene.primitives.add(_3DTileset);
      //贴地显示
      const height = 40;
      const cartographic = Cartographic.fromCartesian(
        _3DTileset.boundingSphere.center
      );
      const surface = Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height
      );
      const offset = Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + height
      );
      const translation = Cartesian3.subtract(
        offset,
        surface,
        new Cartesian3()
      );
      _3DTileset.modelMatrix = Matrix4.fromTranslation(translation);
      // viewer.flyTo(_3DTileset)
      const mouseClickHandler = new ScreenSpaceEventHandler(
        viewer.scene.canvas
      );
      mouseClickHandler.setInputAction((e) => {
        const { position } = e;
        const ray = viewer.camera.getPickRay(position);
        const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
        const radians =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
        const lat = CesiumMath.toDegrees(radians.latitude); //弧度转度
        const lng = CesiumMath.toDegrees(radians.longitude);
        const alt = radians.height;
        console.log(`longitude:${lng},latitude:${lat},height:${alt}`);
      }, ScreenSpaceEventType.LEFT_CLICK);
    });

    const points: HeatmapPoint[] = [];
    fetch("/datas/geojson/busstop2016.geojson", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        if (data) {
          const values: number[] = [];
          //   for (let i = 0; i < 22; i++) {
          data.features.forEach(function (feature) {
            const lon = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];
            const _value: number = 100 * Math.random();
            values.push(_value);
            points.push({
              x: lon,
              y: lat,
              value: _value,
            });
          });
          //   }
          console.log(values);
        }

        cesiumHeatmap = new CesiumHeatmap(viewer, {
          zoomToLayer: true,
          points,
          heatmapDataOptions: {
            max: defaultDataValue[1],
            min: defaultDataValue[0],
          },
          heatmapOptions: {
            maxOpacity: defaultOpacityValue[1],
            minOpacity: defaultOpacityValue[0],
          },
          onRadiusChange: (radius) => {
            setRadius(radius);
          },
        });

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
      });
    });
  }, []);

  function onUpdate(value: [number, number]) {
    cesiumHeatmap.updateHeatMapMaxMin({
      min: value[0],
      max: value[1],
    });
  }

  function onUpdateOpacity(value: [number, number]) {
    cesiumHeatmap.updateHeatmap({
      minOpacity: value[0],
      maxOpacity: value[1],
    } as any);
  }

  function onUpdateRadius(value: number) {
    cesiumHeatmap.updateRadius(value);
  }

  function remove() {
    cesiumHeatmap?.remove();
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "100%" }} id="map"></div>
      <Row
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 5000,
          backgroundColor: "#fff",
        }}
      >
        <Col style={{ padding: 10 }}>
          更新数据的值域:
          <Slider
            style={{ width: 200 }}
            min={0}
            max={1000}
            range
            defaultValue={defaultDataValue}
            onChange={onUpdate}
          />
        </Col>
        <Col style={{ padding: 10 }}>
          更新透明度:
          <Slider
            style={{ width: 200 }}
            step={0.1}
            min={0}
            max={1}
            range
            defaultValue={defaultOpacityValue}
            onChange={onUpdateOpacity}
          />
        </Col>
        <Col style={{ padding: 10 }}>
          更新半径:
          <Slider
            style={{ width: 200 }}
            step={0.1}
            min={0}
            max={100}
            value={radius}
            onChange={onUpdateRadius}
          />
        </Col>
        <Col style={{ padding: 10 }}>
          <Button type="primary" onClick={remove}>
            移除
          </Button>
        </Col>
        <Col style={{ padding: 10 }}>
          <Button
            type="primary"
            onClick={() => {
              window.location.reload();
            }}
          >
            重载
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PHeatMap;
