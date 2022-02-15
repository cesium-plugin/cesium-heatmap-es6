import { Viewer } from "cesium";
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
    gradient?: {
        [key: string]: string;
    } | undefined;
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
export interface HeatmapConfiguration extends BaseHeatmapConfiguration {
}
export interface HeatmapDataOption {
    max?: number;
    min?: number;
}
export declare type RenderType = "primitive" | "imagery" | "entity";
export interface CesiumHeatmapOption {
    noLisenerCamera?: boolean;
    cameraHeightDistance?: number;
    renderType?: RenderType;
    points: HeatmapPoint[];
    bounds?: number[];
    heatmapOptions?: BaseHeatmapConfiguration;
    heatmapDataOptions?: HeatmapDataOption;
    zoomToLayer?: boolean;
    onRadiusChange?: (radius: number) => void;
}
export declare type Bounds = [number, number, number, number];
/**
 * 热度图
 */
export declare class CesiumHeatmap {
    private viewer;
    private element?;
    private initOptions;
    private heatmapOptions?;
    private heatmapDataOptions?;
    private provider?;
    private heatmap?;
    private cameraMoveEnd?;
    private bounds;
    private lastCameraHeight;
    private initRadius;
    constructor(viewer: Viewer, options: CesiumHeatmapOption);
    /**
     * 设置数据的最大最小值
     * @param dataOption
     */
    updateHeatMapMaxMin(dataOption: HeatmapDataOption): void;
    /**
     * 更新热度图配置
     * @param options
     */
    updateHeatmap(options: HeatmapConfiguration): void;
    /**
     * 更新半径
     * @param radius
     */
    updateRadius(radius: number): void;
    /**
     * 移除
     */
    remove(): void;
    private createLayer;
    private createPrimitive;
    private createSingleTileImageryLayer;
    private getImageMaterialProperty;
    private createEntity;
    private updateLayer;
    /**
     * 添加相机的监听
     */
    private addLisener;
    /**
     *
     * @param points
     * @param expand
     * @returns
     */
    private getBounds;
    private createContainer;
}
