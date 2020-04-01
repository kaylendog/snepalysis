import parse from 'csv-parse';
import { createReadStream, readdirSync } from 'fs';
import * as path from 'path';

import { Entry } from '@snepalysis/shared';

import { RECORD_TYPES, RecordType } from '../csv';
import { DATA_PATH } from '../env';

/**
 * Read the .csv files in the repository.
 */
export const readRepository = async (): Promise<Entry[]> => {
  const files = readdirSync(DATA_PATH);
  const entries: Entry[] = [];

  let skippedFiles = 0;
  let totalRecords = 0;

  // Iterate over each file, reading it and converting it to something JS can work with
  const workers = files.map(async (file) => {
    // Skip non-csv files
    if (!file.endsWith('.csv')) {
      return;
    }

    // The CSV parsers
    const parser = createReadStream(path.resolve(DATA_PATH, file)).pipe(
      parse()
    );

    /**
     * Current row number.
     */
    let row = 0;

    /**
     * The column information for the current file.
     */
    let type: RecordType;

    for await (const record of parser) {
      if (row === 0) {
        // Find the column names of this file, and thus the record type
        const header = record.join(', ').replace(/[^\x00-\x7F]/g, '');
        type = RECORD_TYPES.find((v) => v.header == header);

        if (!type) {
          return skippedFiles++;
        }
      }

      const entry = type.parse(record);

      if (entry) {
        entries.push(entry);
      }
      row++;
    }
    totalRecords += row;
  });

  await Promise.all(workers);

  console.log(
    `info: Matched ${entries.length}/${totalRecords} records, skipped ${skippedFiles} files.`
  );

  return entries;
};
