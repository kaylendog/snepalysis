/**
 * Utils relating to the handling of CSV data.
 */

/**
 * A class for dealing with how records should be parsed, given the columns of the table.
 */
export class RecordType {
  public columns = this.header.split(',');
  constructor(readonly header: string) {}

  /**
   * Create record types from table headers.
   * @param headers
   */
  static fromHeaders(headers: string[]): RecordType[] {
    return headers.map((v) => new RecordType(v));
  }
}

/**
 * A class for dealing with the parsing of CSV records.
 */
export class RecordParser {
  /**
   * The record type to use when parsing.
   */
  public recordType: RecordType;

  public recordCount = 0;

  /**
   * Parse using the given record type.
   */
  public using(type: RecordType): this {
    this.recordType = type;
    return this;
  }

  /**
   * Parse a record.
   * @param record
   */
  public parse(record: string[]): void {
    if (record.length !== this.recordType.columns.length) {
      throw Error('Mismatching column schemas.');
    }
    this.recordCount++;
  }
}
