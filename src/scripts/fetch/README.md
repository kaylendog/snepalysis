# fetch

The `fetch` script downloads case-by-case data from the JHU Covid-19 database and uploads them to a local MongoDB database.

## Tasks

- `cloneRepository` - Clones the repository to the local disk, caching it for later use.
- `updateRepository` - Pulls any changes from the remote repository to the local, allowing for new cases to be added to the database.
- `readRepository`- Parses the repository's CSV data into Mongo objects, filtering for country and state as required.
- `updateDatabase` - Fetches old cases from the database, compares it with cases in the latest repository commit, and pushes any changes & additions made back to the database.

## Arguments

The script can have a number of arguments passed to it at runtime:

### Offline Mode, `-c`

Prevents the script from attempting to clone & update the local repository, using the most recent local copy of the repository.

### Force Update, `-f`

Forces the script to attempt to update the database using the repository, even if no changes have been made to the repo.

### Country Filter, `-c <country>`

Filters for the specified country, skipping any other cases.

### State Filter, `-s <state>`

Filters for the specified state - not necessarily a US one. Will return states from multiple countries.
