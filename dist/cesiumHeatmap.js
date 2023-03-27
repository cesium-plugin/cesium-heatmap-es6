import { EllipsoidSurfaceAppearance, GeometryInstance, Material, Primitive, Rectangle, RectangleGeometry, SingleTileImageryProvider, ImageryLayer, ImageMaterialProperty, Entity } from "cesium";
import h337 from './heatmap.js'; //只能使用2.0.0版本，高版本热度图有出不来的情况，并且2.0.0 npm包有问题，只能通过修改使用这个js
const Max = (arr) => {
    let len = arr.length;
    let max = -Infinity;
    while (len--) {
        max = arr[len] > max ? arr[len] : max;
    }
    return max;
};
const Min = (arr) => {
    let len = arr.length;
    let min = Infinity;
    while (len--) {
        min = arr[len] < min ? arr[len] : min;
    }
    return min;
};
/**
 * 热度图
 */
export class CesiumHeatmap {
    constructor(viewer, options) {
        var _a, _b, _c;
        this.bounds = [0, 0, 0, 0];
        this.lastCameraHeight = 0;
        this.initRadius = 10;
        this.viewer = viewer;
        this.initOptions = Object.assign({}, options);
        if ((_a = this.initOptions) === null || _a === void 0 ? void 0 : _a.points) {
            const bounds = this.getBounds(this.initOptions.points);
            this.bounds = bounds;
            const { container, width, height } = this.createContainer(bounds);
            this.element = container;
            const datas = [];
            const values = [];
            for (let i in this.initOptions.points) {
                const point = this.initOptions.points[i];
                const x = ((point.x - bounds[0]) / (bounds[2] - bounds[0])) * width; //屏幕坐标x
                const y = ((bounds[3] - point.y) / (bounds[3] - bounds[1])) * height; //屏幕坐标y
                const dataPoint = {
                    x: x,
                    y: y,
                    value: point.value,
                };
                if (typeof point.value === "number")
                    values.push(point.value);
                datas.push(dataPoint);
            }
            //数据的最大值和最小值
            let _min = values.length > 100000 ? Min(values) : Math.min(...values);
            let _max = values.length > 100000 ? Max(values) : Math.max(...values);
            if ((_b = this.initOptions) === null || _b === void 0 ? void 0 : _b.heatmapDataOptions) {
                const { min, max } = this.initOptions.heatmapDataOptions;
                if (typeof min === "number") {
                    _min = min;
                }
                if (typeof max === "number") {
                    _max = max;
                }
            }
            this.heatmapDataOptions = { min: _min, max: _max };
            const data = {
                max: _max,
                min: _min,
                data: datas,
            };
            const defaultOptions = {
                maxOpacity: 0.9,
                // radius: minRadius,
                // minimum opacity. any value > 0 will produce
                // no transparent gradient transition
                minOpacity: 0.1,
                gradient: {
                    // enter n keys between 0 and 1 here
                    // for gradient color customization
                    ".3": "blue",
                    ".5": "green",
                    ".7": "yellow",
                    ".95": "red",
                },
            };
            const _options = this.initOptions.heatmapOptions
                ? Object.assign(Object.assign({}, defaultOptions), this.initOptions.heatmapOptions) : defaultOptions;
            //初始化半径
            if ((_c = this.heatmapOptions) === null || _c === void 0 ? void 0 : _c.radius) {
                this.initRadius = this.heatmapOptions.radius;
            }
            this.heatmapOptions = Object.assign({}, _options);
            const options = Object.assign(Object.assign({}, _options), { container });
            this.heatmap = h337.create(options);
            this.heatmap.setData(data);
            this.createLayer();
            if (!this.initOptions.noLisenerCamera) {
                this.addLisener();
            }
            if (this.initOptions.zoomToLayer && bounds) {
                this.viewer.camera.flyTo({
                    destination: Rectangle.fromDegrees(...bounds),
                });
            }
        }
    }
    /**
     * 设置数据的最大最小值
     * @param dataOption
     */
    updateHeatMapMaxMin(dataOption) {
        const { min, max } = dataOption;
        if (this.heatmap) {
            if (typeof min === "number") {
                this.heatmap.setDataMin(min);
                if (this.heatmapDataOptions)
                    this.heatmapDataOptions.min = min;
            }
            if (typeof max === "number") {
                this.heatmap.setDataMax(max);
                if (this.heatmapDataOptions)
                    this.heatmapDataOptions.max = max;
            }
        }
        this.updateLayer();
    }
    /**
     * 更新热度图配置
     * @param options
     */
    updateHeatmap(options) {
        const { heatmapOptions } = this;
        this.heatmap.configure(Object.assign(Object.assign({}, heatmapOptions), options));
        this.updateLayer();
    }
    /**
     * 更新半径
     * @param radius
     */
    updateRadius(radius) {
        var _a;
        const { heatmapOptions } = this;
        const currentData = this.heatmap.getData();
        if (currentData === null || currentData === void 0 ? void 0 : currentData.data) {
            for (let i in currentData.data) {
                const data = currentData.data[i];
                data.radius = radius;
            }
        }
        this.heatmap.setData(currentData);
        this.heatmapOptions = Object.assign(Object.assign({}, heatmapOptions), { radius });
        this.updateLayer();
        if ((_a = this.initOptions) === null || _a === void 0 ? void 0 : _a.onRadiusChange) {
            this.initOptions.onRadiusChange(radius);
        }
    }
    /**
     * 移除
     */
    remove() {
        if (this.element) {
            document.body.removeChild(this.element);
            this.element = undefined;
            if (this.provider instanceof ImageryLayer) {
                if (this.provider)
                    this.viewer.imageryLayers.remove(this.provider);
                this.createSingleTileImageryLayer();
            }
            else if (this.provider instanceof Primitive) {
                this.viewer.scene.primitives.remove(this.provider);
            }
            else if (this.provider instanceof Entity) {
                this.viewer.entities.remove(this.provider);
            }
            if (this.cameraMoveEnd) {
                this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
                this.cameraMoveEnd = undefined;
            }
        }
    }
    createLayer() {
        if (this.initOptions.renderType === "primitive") {
            this.createPrimitive();
        }
        else if (this.initOptions.renderType === "imagery") {
            this.createSingleTileImageryLayer();
        }
        else {
            this.createEntity();
        }
    }
    createPrimitive() {
        const url = this.heatmap.getDataURL();
        this.provider = this.viewer.scene.primitives.add(new Primitive({
            geometryInstances: new GeometryInstance({
                geometry: new RectangleGeometry({
                    rectangle: Rectangle.fromDegrees(...this.bounds),
                    vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                }),
            }),
            appearance: new EllipsoidSurfaceAppearance({
                aboveGround: false,
            }),
            show: true,
        }));
        if (this.provider) {
            this.provider.appearance.material = new Material({
                fabric: {
                    type: "Image",
                    uniforms: {
                        image: url,
                    },
                },
            });
        }
    }
    createSingleTileImageryLayer() {
        const url = this.heatmap.getDataURL();
        this.provider = this.viewer.imageryLayers.addImageryProvider(new SingleTileImageryProvider({
            url: url,
            rectangle: Rectangle.fromDegrees(...this.bounds),
        }));
    }
    getImageMaterialProperty() {
        const url = this.heatmap.getDataURL();
        const material = new ImageMaterialProperty({
            image: url,
        });
        return material;
    }
    createEntity() {
        this.provider = this.viewer.entities.add({
            show: true,
            rectangle: {
                coordinates: Rectangle.fromDegrees(...this.bounds),
                material: this.getImageMaterialProperty(),
            },
        });
    }
    updateLayer() {
        const src = this.heatmap.getDataURL();
        if (this.provider instanceof ImageryLayer) {
            if (this.provider)
                this.viewer.imageryLayers.remove(this.provider);
            this.createSingleTileImageryLayer();
        }
        else if (this.provider instanceof Primitive) {
            this.provider.appearance.material.uniforms.image = src;
        }
        else if (this.provider instanceof Entity) {
            if (this.provider.rectangle)
                this.provider.rectangle.material = this.getImageMaterialProperty();
        }
    }
    /**
     * 添加相机的监听
     */
    addLisener() {
        const maxRadius = 100;
        const min = 6375000;
        const max = 10000000;
        this.cameraMoveEnd = () => {
            var _a;
            if (this.heatmapOptions && this.heatmap && this.heatmapDataOptions) {
                const h = this.viewer.camera.getMagnitude();
                const distance = ((_a = this === null || this === void 0 ? void 0 : this.initOptions) === null || _a === void 0 ? void 0 : _a.cameraHeightDistance)
                    ? this.initOptions.cameraHeightDistance
                    : 1000;
                if (Math.abs(h - this.lastCameraHeight) > distance) {
                    this.lastCameraHeight = h;
                    if (typeof min === "number" && typeof max === "number") {
                        const radius = parseInt((this.initRadius +
                            ((maxRadius - this.initRadius) * (h - min)) / (max - min)).toFixed(0));
                        if (radius) {
                            this.updateRadius(radius);
                        }
                    }
                }
            }
        };
        this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
    }
    /**
     *
     * @param points
     * @param expand
     * @returns
     */
    getBounds(points) {
        if (points) {
            let lonMin = 180;
            let lonMax = -180;
            let latMin = 90;
            let latMax = -180;
            points.forEach(function (point) {
                const { x: longitude, y: latitude } = point;
                lonMin = longitude < lonMin ? longitude : lonMin;
                latMin = latitude < latMin ? latitude : latMin;
                lonMax = longitude > lonMax ? longitude : lonMax;
                latMax = latitude > latMax ? latitude : latMax;
            });
            const xRange = lonMax - lonMin ? lonMax - lonMin : 1;
            const yRange = latMax - latMin ? latMax - latMin : 1;
            return [
                lonMin - xRange / 10,
                latMin - yRange / 10,
                lonMax + xRange / 10,
                latMax + yRange / 10,
            ];
        }
        return [0, 0, 0, 0];
    }
    createContainer(bounds) {
        const container = document.createElement("div");
        const width = 1000;
        const height = parseInt(((1000 / (bounds[2] - bounds[0])) * (bounds[3] - bounds[1])).toFixed(0));
        container.setAttribute("style", `width:${width}px;height:${height}px;display:none;`);
        document.body.appendChild(container);
        return { container, width, height };
    }
}
