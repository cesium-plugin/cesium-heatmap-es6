import { EllipsoidSurfaceAppearance, GeometryInstance, Material, Primitive, Rectangle, RectangleGeometry, Viewer, Event, SingleTileImageryProvider, ImageryLayer, ImageMaterialProperty, Entity } from "cesium";
import h337 from './heatmap.js'//只能使用2.0.0版本，高版本热度图有出不来的情况，并且2.0.0 npm包有问题，只能通过修改使用这个js
export interface BaseHeatmapConfiguration {
  /**
   * A background color string in form of hexcode, color name, or rgb(a)
   */
  backgroundColor?: string | undefined;

  /**
   * The blur factor that will be applied to all datapoints. The higher the
   * blur factor is, the smoother the gradients will be
   * Default value: 0.85
   */
  blur?: number | undefined;

  /**
   * An object that represents the gradient.
   * Syntax: {[key: number in range [0,1]]: color}
   */
  gradient?: { [key: string]: string } | undefined;

  /**
   * The maximal opacity the highest value in the heatmap will have. (will be
   * overridden if opacity set)
   * Default value: 0.6
   */
  maxOpacity?: number | undefined;

  /**
   * The minimum opacity the lowest value in the heatmap will have (will be
   * overridden if opacity set)
   */
  minOpacity?: number | undefined;

  /**
   * A global opacity for the whole heatmap. This overrides maxOpacity and
   * minOpacity if set
   * Default value: 0.6
   */
  opacity?: number | undefined;

  /**
   * The radius each datapoint will have (if not specified on the datapoint
   * itself)
   */
  radius?: number | undefined;

  /**
   * The property name of the value/weight in a datapoint
   * Default value: 'value'
   */
  valueField?: undefined;

  /**
   * Pass a callback to receive extrema change updates. Useful for DOM
   * legends.
   */
  onExtremaChange?: (() => void) | undefined;

  /**
   * Indicate whether the heatmap should use a global extrema or a local
   * extrema (the maximum and minimum of the currently displayed viewport)
   */
  useLocalExtrema?: boolean | undefined;
}
export interface HeatmapPoint {
  x: number;
  y: number;
  value?: number;
}

export interface HeatmapConfiguration extends BaseHeatmapConfiguration {}
export interface HeatmapDataOption {
  max?: number; //数据最大值
  min?: number; //数据最小值
}

export type RenderType = "primitive" | "imagery" | "entity";
export interface CesiumHeatmapOption {
  noLisenerCamera?: boolean; //不监听相机
  cameraHeightDistance?: number; //相机高度的差值，大于这个值时重新渲染底图
  renderType?: RenderType; //渲染类型
  points: HeatmapPoint[];
  bounds?: number[];
  heatmapOptions?: BaseHeatmapConfiguration;
  heatmapDataOptions?: HeatmapDataOption;
  zoomToLayer?: boolean;
  onRadiusChange?: (radius: number) => void;
}

export type Bounds = [number, number, number, number];

const Max = (arr: number[]) => {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
};

const Min = (arr: number[]) => {
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
  private viewer: Viewer;
  private element?: HTMLElement;
  private initOptions: CesiumHeatmapOption;
  private heatmapOptions?: HeatmapConfiguration;
  private heatmapDataOptions?: HeatmapDataOption;
  private provider?: any;
  private heatmap?: any;
  private cameraMoveEnd?: Event.RemoveCallback;
  private bounds: Bounds = [0, 0, 0, 0];
  private lastCameraHeight = 0;
  private initRadius = 10;
  constructor(viewer: Viewer, options: CesiumHeatmapOption) {
    this.viewer = viewer;
    this.initOptions = { ...options };
    if (this.initOptions?.points) {
      const bounds: Bounds = this.getBounds(this.initOptions.points);
      this.bounds = bounds;
      const { container, width, height } = this.createContainer(bounds);
      this.element = container;
      const datas = [];
      const values: number[] = [];
      for (let i in this.initOptions.points) {
        const point = this.initOptions.points[i];
        const x = ((point.x - bounds[0]) / (bounds[2] - bounds[0])) * width; //屏幕坐标x
        const y = ((bounds[3] - point.y) / (bounds[3] - bounds[1])) * height; //屏幕坐标y
        const dataPoint = {
          x: x,
          y: y,
          value: point.value,
        };
        if (typeof point.value === "number") values.push(point.value);
        datas.push(dataPoint);
      }

      //数据的最大值和最小值
      let _min = values.length > 100000 ? Min(values) : Math.min(...values);
      let _max = values.length > 100000 ? Max(values) : Math.max(...values);
      if (this.initOptions?.heatmapDataOptions) {
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
        ? { ...defaultOptions, ...this.initOptions.heatmapOptions }
        : defaultOptions;

      //初始化半径
      if (this.heatmapOptions?.radius) {
        this.initRadius = this.heatmapOptions.radius;
      }

      this.heatmapOptions = { ..._options };
      const options = {
        ..._options,
        container,
      };
      this.heatmap = h337.create(options);
      this.heatmap.setData(data as any);
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
  updateHeatMapMaxMin(dataOption: HeatmapDataOption) {
    const { min, max } = dataOption;
    if (this.heatmap) {
      if (typeof min === "number") {
        this.heatmap.setDataMin(min);
        if (this.heatmapDataOptions) this.heatmapDataOptions.min = min;
      }
      if (typeof max === "number") {
        this.heatmap.setDataMax(max);
        if (this.heatmapDataOptions) this.heatmapDataOptions.max = max;
      }
    }
    this.updateLayer();
  }

  /**
   * 更新热度图配置
   * @param options
   */
  updateHeatmap(options: HeatmapConfiguration) {
    const { heatmapOptions } = this;
    this.heatmap.configure({ ...heatmapOptions, ...options });
    this.updateLayer();
  }

  /**
   * 更新半径
   * @param radius
   */
  updateRadius(radius: number) {
    const { heatmapOptions } = this;
    const currentData = this.heatmap.getData();
    if (currentData?.data) {
      for (let i in currentData.data) {
        const data = currentData.data[i];
        data.radius = radius;
      }
    }
    this.heatmap.setData(currentData);
    this.heatmapOptions = { ...heatmapOptions, ...{ radius } };
    this.updateLayer();
    if (this.initOptions?.onRadiusChange) {
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
        if (this.provider) this.viewer.imageryLayers.remove(this.provider);
        this.createSingleTileImageryLayer();
      } else if (this.provider instanceof Primitive) {
        this.viewer.scene.primitives.remove(this.provider);
      } else if (this.provider instanceof Entity) {
        this.viewer.entities.remove(this.provider);
      }
      if (this.cameraMoveEnd) {
        this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
        this.cameraMoveEnd = undefined;
      }
    }
  }

  private createLayer() {
    if (this.initOptions.renderType === "primitive") {
      this.createPrimitive();
    } else if (this.initOptions.renderType === "imagery") {
      this.createSingleTileImageryLayer();
    } else {
      this.createEntity();
    }
  }

  private createPrimitive() {
    const url = this.heatmap.getDataURL();
    this.provider = this.viewer.scene.primitives.add(
      new Primitive({
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
      })
    );
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

  private createSingleTileImageryLayer() {
    const url = this.heatmap.getDataURL();
    this.provider = this.viewer.imageryLayers.addImageryProvider(
      new SingleTileImageryProvider({
        url: url,
        rectangle: Rectangle.fromDegrees(...this.bounds),
      })
    );
  }

  private getImageMaterialProperty() {
    const url = this.heatmap.getDataURL();
    const material = new ImageMaterialProperty({
      image: url,
    });
    return material;
  }

  private createEntity() {
    this.provider = this.viewer.entities.add({
      show: true,
      rectangle: {
        coordinates: Rectangle.fromDegrees(...this.bounds),
        material: this.getImageMaterialProperty(),
      },
    });
  }

  private updateLayer() {
    const src = this.heatmap.getDataURL();
    if (this.provider instanceof ImageryLayer) {
      if (this.provider) this.viewer.imageryLayers.remove(this.provider);
      this.createSingleTileImageryLayer();
    } else if (this.provider instanceof Primitive) {
      this.provider.appearance.material.uniforms.image = src;
    } else if (this.provider instanceof Entity) {
      if (this.provider.rectangle)
        this.provider.rectangle.material = this.getImageMaterialProperty();
    }
  }

  /**
   * 添加相机的监听
   */
  private addLisener() {
    const maxRadius = 100;
    const min = 6375000;
    const max = 10000000;
    this.cameraMoveEnd = () => {
      if (this.heatmapOptions && this.heatmap && this.heatmapDataOptions) {
        const h = this.viewer.camera.getMagnitude();
        const distance = this?.initOptions?.cameraHeightDistance
          ? this.initOptions.cameraHeightDistance
          : 1000;
        if (Math.abs(h - this.lastCameraHeight) > distance) {
          this.lastCameraHeight = h;
          if (typeof min === "number" && typeof max === "number") {
            const radius = parseInt(
              (
                this.initRadius +
                ((maxRadius - this.initRadius) * (h - min)) / (max - min)
              ).toFixed(0)
            );
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
  private getBounds(points: HeatmapPoint[]) {
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
      ] as Bounds;
    }
    return [0, 0, 0, 0] as Bounds;
  }

  private createContainer(bounds: number[]) {
    const container = document.createElement("div");
    const width = 1000;
    const height = parseInt(
      ((1000 / (bounds[2] - bounds[0])) * (bounds[3] - bounds[1])).toFixed(0)
    );
    container.setAttribute(
      "style",
      `width:${width}px;height:${height}px;display:none;`
    );
    document.body.appendChild(container);
    return { container, width, height };
  }
}
