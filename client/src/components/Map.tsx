import * as React from 'react';
import ReactMapGL, { Source, Layer } from 'react-map-gl';
import { DataContext } from '../context/DataContext';
import { heatmapLayer } from './heatmap';

/**
 * Map component.
 * @param props
 */
export const Map: React.FC<{ width: number; height: number }> = () => {
  const [viewport, setViewport] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 31,
    longitude: -99,
    zoom: 5,
  });

  return (
    <DataContext.Consumer>
      {(data): JSX.Element => (
        <ReactMapGL
          {...viewport}
          onViewportChange={setViewport}
          mapboxApiAccessToken={
            'pk.eyJ1Ijoia2lwcGZveHgiLCJhIjoiY2szM2RxcGxjMHJkdzNkbWp4anFjZGszNyJ9.GbkrTf_7j9IyehCYKDtGhQ'
          }
          mapStyle="mapbox://styles/mapbox/dark-v9"
        >
          {data.features.length > 0 && (
            <Source type="geojson" data={data}>
              <Layer {...heatmapLayer}></Layer>
            </Source>
          )}
        </ReactMapGL>
      )}
    </DataContext.Consumer>
  );
};
