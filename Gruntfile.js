module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),    
    
    bower: {
      target: {
        options: {
          baseUrl:'.' 
        },
        rjsConfig: 'example/config.js'
      }
    },

    requirejs: {
      app: {
        options: {
          baseUrl: "",
          mainConfigFile: "example/config.js",
          name: "example/libs/require",
          include: [
            'example/config', // this is needed for knowing about paths and dependencies
            'prototypes/module',
            'prototypes/transition'
          ],
          out: "example/build.js",
          optimize: "uglify",
          preserveLicenseComments: false,
          paths: {
            'fancybox': 'bower_components/fancybox/source/jquery.fancybox.pack'
          }
        }
      },
    },

    watch: {
      scripts: {
        files: [
          'core/**/*.js',
          'managers/**/*.js',
          'prototypes/**/*.js',
          'example/**/*.js'
        ],
        tasks: ['requirejs:app'],
        options: {
          spawn: false,
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['bower:target','requirejs:app']);
  grunt.registerTask('build', ['requirejs:core']);
  //grunt.registerTask('watch', ['watch']);

};