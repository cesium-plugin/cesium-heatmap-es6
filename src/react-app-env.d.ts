/// <reference types="react-scripts" />

declare var Cesium: any;
declare var ConfigurationExt: any;
declare var CesiumNavigation: any;
declare module "video-react" {
    export const Player, BigPlayButton
}

declare module 'cesium-navigation-es6' {
    const CesiumNavigation: any;
    export = CesiumNavigation;
}

declare module "*.md" {
    const content: string;
    export default content;
}

declare module 'coordtransform'

declare module "uuid"
//超图
declare var SuperMapTerrainProvider: any
declare module "s3m_parser_es6/S3MTiles/S3MTilesLayer"

