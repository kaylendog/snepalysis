import * as React from 'react';
import axios from 'axios';
import { DataContext } from './DataContext';

const REQUEST = axios.create({
  baseURL: 'http://localhost:8080/',
});

/**
 * Component for dealing with API data.
 */
export class DataManager extends React.Component<
  {
    children?: React.ReactChild;
  },
  { didDownloadData: boolean }
> {
  state = {
    didDownloadData: false,
  };

  render(): React.ReactChild {
    return (
      <DataContext.Provider value={this._data}>
        {this.props.children}
      </DataContext.Provider>
    );
  }

  componentDidMount(): void {
    this.fetchData();
  }

  /**
   * Temporary data store while we're downloading data.
   */
  private _data: GeoJSON.FeatureCollection = {
    features: [],
    type: 'FeatureCollection',
  };

  /**
   * Fetch heatmap data from the API.
   */
  async fetchData(): Promise<void> {
    console.log('Fetching case data from API...');
    const { data } = await REQUEST.get<{ count: number; pages: number }>(
      '/data'
    );

    console.log(`Will fetch ${data.pages} pages with ${data.count} entries.`);

    for (let page = 1; page <= data.pages; page++) {
      const { data } = await REQUEST.get<GeoJSON.Feature[]>(
        `/data?page=${page}`
      );
      this._data.features.push(...data);
    }

    console.log(
      'Successfully recieved',
      this._data.features.length,
      'entries.'
    );

    console.log(this._data);
    this.setState({ didDownloadData: true });
  }
}
