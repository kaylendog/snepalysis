/**
 * Utils relating to the handling of CSV data.
 */

import { Entry } from '../../models/Entry';
import { COUNTRY, STATE } from './env';

/**
 * A class for dealing with how records should be parsed, given the columns of the table.
 */
export class RecordType {
  private _columns = this.header.split(', ');

  /**
   * An object mapping column index to entry field.
   */
  private _indexMap: {
    [K in keyof Entry]: number;
  } = { country: -1, lat: -1, long: -1, state: -1 };

  /**
   * An object containing arrays of filters for each entry key.
   */
  private _filters: {
    [K in keyof Entry]: ((value: string) => boolean)[];
  } = { country: [], lat: [], long: [], state: [] };

  constructor(readonly header: string) {}

  /**
   * Create a record type from a table header.
   */
  static from(header: string): RecordType {
    return new RecordType(header);
  }

  /**
   * Map a column to entry property.
   * @param key
   * @param mapToColumn
   */
  public column(key: keyof Entry, mapToColumn: string): this {
    const index = this._columns.indexOf(mapToColumn);

    if (index == -1) {
      throw Error(`Invalid column name '${mapToColumn}'`);
    }

    this._indexMap[key] = index;
    return this;
  }

  /**
   * Map multiple columns
   * @param entry
   */
  public columns(entries: { [K in keyof Entry]: string }): this {
    for (const key in entries) {
      this.column(key as keyof Entry, entries[key]);
    }
    return this;
  }

  /**
   * Filter records by column.
   * @param columnName
   * @param filter
   */
  public filter(key: keyof Entry, filter: (value: string) => boolean): this {
    if (!this._filters[key]) {
      this._filters[key] = [filter];
    }

    this._filters[key].push(filter);
    return this;
  }

  /**
   * Return the mapped index of an entry key.
   */
  public prop(key: keyof Entry): number {
    return this._indexMap[key];
  }

  /**
   * Extract a record parameter.
   */
  public extract(key: keyof Entry, record: string[]): string {
    return record[this.prop(key)];
  }

  /**
   * Parse a record.
   * @param record
   */
  parse(record: string[]): Entry | undefined {
    for (const key in this._filters) {
      // For each key of the filter object attached to this type,
      // run the filters and skip records if they return false.
      for (const filter of this._filters[key as keyof Entry]) {
        if (!filter(this.extract(key as keyof Entry, record))) {
          return;
        }
      }
    }

    return {
      country: this.extract('country', record),
      lat: Number(this.extract('lat', record)),
      long: Number(this.extract('long', record)),
      state: this.extract('state', record),
    };
  }
}

/**
 * Valid record types currently used.
 */
export const RECORD_TYPES = [
  // Old header types
  RecordType.from(
    'Province/State, Country/Region, Last Update, Confirmed, Deaths, Recovered, Latitude, Longitude'
  )
    .columns({
      country: 'Country/Region',
      lat: 'Latitude',
      long: 'Longitude',
      state: 'Province/State',
    })
    .filter('country', (v) => (COUNTRY === 'any' ? true : v === COUNTRY))
    .filter('state', (v) => (STATE === 'any' ? true : v === STATE)),
  // New header types
  RecordType.from(
    'FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key'
  )
    .columns({
      country: 'Country_Region',
      lat: 'Lat',
      long: 'Long_',
      state: 'Province_State',
    })
    .filter('country', (v) => (COUNTRY === 'any' ? true : v === COUNTRY))
    .filter('state', (v) => (STATE === 'any' ? true : v === STATE)),
];
