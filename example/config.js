// Set the require.js configuration for your application.
require.config({
  
  baseUrl: '../',

  deps: [ 'main'],

  paths: {
    
    // points to the run-time website conifiguration object
    'website':'example/website',
    
    // points to the main application script 
    'main':'example/main',

    // points to bower components
    'noconflict': 'core/noconflict',
    'jquery': 'bower_components/jquery/dist/jquery.min',
    'backbone': 'bower_components/backbone/backbone',
    'underscore': 'bower_components/underscore/underscore',
    'spin-js': 'bower_components/spin.js/spin',
    'waitforimages': 'bower_components/waitForImages/dist/jquery.waitforimages.min',

  },

  shim: {
    
    // framework dependencies
    'backbone': {
      'deps': ['jquery','underscore']
    },

    // plugin dependencies
    'waitforimages': {
      'deps': ['jquery']
    },
    'spin-js': {
      'deps': ['jquery']
    }

  },
  
  map: {
      // '*': {
      //   'jquery': 'noconflict'
      // },
      // 'noconflict': {
      //   'jquery': 'jquery'
      // }
  },
  
  urlArgs: 't='+(new Date).getTime()

});
