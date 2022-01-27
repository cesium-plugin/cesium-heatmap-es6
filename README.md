# 参考源码
1.[《117颗星 manuelnas/CesiumHeatmap》](https://github.com/manuelnas/CesiumHeatmap)
基于heatmap.min.js，通过绘制Entity(矩形)实体实现，364行代码，有三维效果
2. [《32颗星 postor/cesiumjs-heat 》](https://github.com/postor/cesiumjs-heat)
基于heatmap.min.js，使用SingleTileImageryProvider图层实现，根据镜头移动具有重绘功能，239行代码，无三维效果
3. [《16颗星 wangzhongliang/CesiumHeatmap》](https://github.com/wangzhongliang/CesiumHeatmap)
使用Primitive图元实现，提供了两种方式，优点在于计算范围的方法。
方式一基于heatmap.min.js，157行代码，无三维效果；
方式二基于webgl-heatmap.js，128行代码，无三维效果；

# 特点
1. 提供三种绘制方式，实体（可贴模型，有三维效果）、图元、图层
2. 提供重绘，通过摄像头的高度进行重绘
3. 提供heatmap.js的所有配置参数入口
4. 源码ts编写，发布支持es6和umd两种模式
5. [支持npm安装](https://www.npmjs.com/package/cesium-heatmap-es6)

# 效果图

![效果图](https://img-blog.csdnimg.cn/d6f7e8f5cc8c459db86fd54a4462b3df.gif#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/3717eb863969431885152b3ab67dfd2f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAT05FR0lTRVIoWlBDKQ==,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/9f76a7f833bb400b867d6612eebe0d70.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAT05FR0lTRVIoWlBDKQ==,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)

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