module.exports = {
  launch: {
    dumpio: true,
    headless: false,
    slowMo: 2000
  },
  server: {
    command: 'LOCAL_PROD=true node ./../../server.js',
    port: 8080,
    launchTimeout: 5000,
    debug: true
  }
}