import parse from 'csv-parse';
import { createReadStream, existsSync, readdirSync, rmdirSync } from 'fs';
import * as path from 'path';
import gitP, { SimpleGit } from 'simple-git/promise';

import { RecordParser, RecordType } from '../utils/csv';

/**
 * The directory in which data will be stored and downloaded to.
 */
const DIRECTORY = path.resolve(process.cwd(), './.cache');

/**
 * THe URL of the data repository.
 */
const REPOSITORY_URL = 'https://github.com/CSSEGISandData/COVID-19.git';

/**
 * The path to the data directory of the repository.
 */
const DATA_PATH = path.resolve(
  DIRECTORY,
  'csse_covid_19_data/csse_covid_19_daily_reports'
);

/**
 * git wrapper
 */
const git: SimpleGit = gitP(DIRECTORY).outputHandler(
  (command, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  }
);

/**
 * Valid record types currently used.
 */
const RECORD_TYPES = RecordType.fromHeaders([
  //  'Province/State, Country/Region, Last Update, Confirmed, Deaths, Recovered',
  //  'Province/State, Country/Region, Last Update, Confirmed, Deaths, Recovered, Latitude, Longitude',
  'FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key',
]);

/**
 * Clone the remote repository.
 */
const cloneRepository = async (): Promise<void> => {
  /**
   * Git doesn't allow cloning if the path you're trying to clone to already exists. This check below,
   * and the next one, determine whether:
   *  a) The repository is alreay cloned locally
   *  b) The directory exists, but is empty.
   */

  if (existsSync(DIRECTORY) || existsSync(path.resolve(DIRECTORY, './.git'))) {
    return console.log('info: Skipping cloning repository - already exists.');
  }

  if (existsSync(DIRECTORY)) {
    rmdirSync(DIRECTORY);
  }

  console.log('info: Cloning repository');

  await git.clone(REPOSITORY_URL, DIRECTORY);
  await git.status();
};

/**
 * Pulls any updates made to the repository on the remote to the local.
 */
const updateRepository = async (): Promise<void> => {
  console.log('info: Checking for updates');
  await git.pull('origin', 'master', ['-f']);
};

/**
 * Read the .csv files in the repository.
 */
const readRepository = async (): Promise<void> => {
  const files = readdirSync(DATA_PATH);

  let accumulator = 0;

  // Iterate over each file, reading it and converting it to something JS can work with
  const workers = files.map(async (file, i) => {
    // Skip non-csv files
    if (!file.endsWith('.csv')) {
      console.log(`info: Skipping file '${file}' (${i + 1}/${files.length})`);
      return;
    }

    // The CSV parsers
    const parser = createReadStream(path.resolve(DATA_PATH, file)).pipe(
      parse()
    );

    // Our in-house record parser
    const recordParser = new RecordParser();

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
          console.warn(
            `warn: Column names in file '${file}' not recognised - skipping`
          );
          return;
        }
      }

      recordParser.using(type).parse(record);
      row++;
    }

    accumulator += recordParser.recordCount;
  });

  await Promise.all(workers);
  console.log(`info: Done - got ${accumulator} records.`);
};

(async (): Promise<void> => {
  await cloneRepository();
  await updateRepository();
  await readRepository();
})();
