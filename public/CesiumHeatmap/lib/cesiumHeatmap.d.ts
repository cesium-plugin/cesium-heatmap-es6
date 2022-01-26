import { Viewer } from "cesium";
import * as h337 from 'heatmap.js';
export interface HeatmapPoint {
    x: number;
    y: number;
    value?: number;
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
    heatmapOptions?: h337.BaseHeatmapConfiguration;
    heatmapDataOptions?: HeatmapDataOption;
    zoomToLayer?: boolean;
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
    updateHeatmap(options: h337.HeatmapConfiguration): void;
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
