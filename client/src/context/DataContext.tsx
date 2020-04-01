import * as React from 'react';

/**
 * Data context.
 */
export const DataContext = React.createContext<GeoJSON.FeatureCollection>({
  features: [],
  type: 'FeatureCollection',
});
