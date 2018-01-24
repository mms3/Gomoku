// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAEmDv5ovzSO2xry00CyzduaAiwVrESpQs',
    authDomain: 'gomoku-ms03.firebaseapp.com',
    databaseURL: 'https://gomoku-ms03.firebaseio.com',
    projectId: 'gomoku-ms03',
    storageBucket: 'gomoku-ms03.appspot.com',
    messagingSenderId: '132835733393'
  }
};
