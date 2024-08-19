const path = require("path");


const extraNodeModules = {
  'common': path.resolve(__dirname + '/../Common'),
};
const watchFolders = [
  path.resolve(__dirname),
  path.resolve(__dirname + '/../Common')
];

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  }, 
  resolver: {
    extraNodeModules,
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from common/ to local node_modules
        name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
    }),
    modulesPaths: [
      watchFolders
    ]
  },
  watchFolders,
};

