# webpack-eslint-config

Repository with working ESLint, VSCode, Prettier & Webpack configuration, prebundled with:

-   Webpack Dev Server
-   React
-   TypeScript
-   `awesome-typescript-loader`
-   LESS

## Scripts

`eslint-config` comes with a few built-in scripts to help you get started with the development process.

### yarn start

-   Starts `WDS` on `localhost:3000`.

```bash
$ webpack-dev-server --progress --mode development --config ./webpack/webpack.config.dev.js
# Webpack Build Stats
# ...
# Compiled successfully!
```

### yarn build

```bash
$ webpack --progress --mode production --config ./webpack/webpack.config.prod.js
# Webpack Build Stats
# ...
# Compiled successfully!
```
