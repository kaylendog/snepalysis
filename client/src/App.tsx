import * as React from 'react';
import { hot } from 'react-hot-loader/root';

import './index.less';
import { Map } from './components/Map';
import { DataManager } from './context/DataManager';

const App = (): JSX.Element => (
  <DataManager>
    <Map height={window.innerHeight} width={window.innerWidth}></Map>
  </DataManager>
);

export const AppWithHMR = hot(App);
