import './App.less';
import { ConfigProvider, Spin } from 'antd';
import { Suspense } from 'react';
import zhCN from 'antd/lib/locale/zh_CN';
import { WebRoutes } from './webRoutes';
import "cesium/Build/Cesium/Widgets/widgets.css"

function App() {
  return <Suspense fallback={<Spin style={{ position: "absolute", top: "50%", left: "50%" }} spinning={true}></Spin>}>
    <ConfigProvider locale={zhCN}>
      <WebRoutes />
    </ConfigProvider>
  </Suspense>
}

export default App;
