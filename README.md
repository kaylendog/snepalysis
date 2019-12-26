# eslint-template

Repository with working ESLint, VSCode and Prettier configuration, prebundled with:

-   ESLint
-   Prettier support
-   TypeScript
-   `ts-node`

## Scripts

`eslint-config` comes with a few built-in scripts to help you get started with the development process.

### yarn lint

-   Runs ESLint on all files in the `src` directory. Changing this will change where ESLint looks for files to lint.

### yarn build

-   Simultaneously runs the TypeScript compiler and lints your code at the same time.
-   Compiled TypeScript gets sent into the `dist` directory as specified in `tsconfig.json`.

```bash
$ tsc --project ./ && eslint ./src/**/*.*
# Some lovely linting output
# ...
# Done in 5s
```

### yarn build:watch

-   Starts the TypeScript compiler in watch mode.
-   Useful if you wish to actively compile your code for type-checking purposes, without having to run it.
