# [Arg2P-Kt](https://github.com/tuProlog/arg2p-kt) Web Playground

## Install
```bash
  npm install
  sed -i 's/return solverFactory(ModuleNames_instance\.r2z(true), \[ModuleNames_instance\.r2z(false)\]);/return require\("\.\/2p-solve-classic\.js"\)\.it\.unibo\.tuprolog\.solve\.classic\.ClassicSolverFactory;/' node_modules/@tuprolog/arg2p/2p-solve.js
```

## Usage

- Start Webpack Dev server

```bash
  npm start
```

- Run mocha test

```bash
  npm test
```

- Build and create production ready artifacts in `prodDist` folder

```bash
  npm run build
```

- Deploy `prodDist` folder to Githun Pages

```bash
  npm run deploy
```
