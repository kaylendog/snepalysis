import gitP, { SimpleGit } from 'simple-git/promise';
import { DIRECTORY } from './env';

/**
 * Git client wrapper.
 */
export const git: SimpleGit = gitP(DIRECTORY).outputHandler(
  (command, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  }
);
