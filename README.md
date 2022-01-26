# 插件使用方法

## 安装
`npm install cesium-heatmap-es6`


## 文档

自行打开docs文件夹
## umd模式

```javascript
<script type="text/javascript" src="./CesiumHeatmap/dist/cesium-heatmap-es6.umd.js"></script>
 const defaultDataValue = [10, 500]
        const defaultOpacityValue = [0, 1]
  const points = []
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
                const earthHeatMap = new CesiumHeatmap(viewer,
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
            })
        })
```

## es6模式
```javascript
 const defaultDataValue = [10, 500]
        const defaultOpacityValue = [0, 1]
import { CesiumHeatmap, HeatmapPoint } from "cesium-heatmap-es6"

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
            })
        })
```

# 源码使用方法
## 依赖安装
`npm run a`

## 项目运行
`npm start`

## 项目打包
`npm run build`

## 发布
`npm run release`