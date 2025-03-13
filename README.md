# 2P-Kt Playground
2P-Kt Playground Web project
## Install
```bash
  npm install
```
## Usage


```bash
  "scripts": {
    "start": "...",
    "build": "...",
    "test": "..."
  },
```
### npm start
* start Webpack Dev server using unminified sourcers('js')
### npm run build
* run test
* build and create production ready artifacts in `prodDist` folder.
### npm test
* runs mocha test


## Temporary fix

Replace in 2p-solve.js:

`return solverFactory(ModuleNames_instance.l2z(true), [ModuleNames_instance.l2z(false)])`

with 

`return require("./2p-solve-classic.js").it.unibo.tuprolog.solve.classic.ClassicSolverFactory`

