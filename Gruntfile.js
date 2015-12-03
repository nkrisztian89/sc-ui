
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'browserify': {
      socket: {
        src: [],
        dest: 'public/build/socket.js',
        options: {
          alias: {
            socket: './node_modules/socket.io/node_modules/socket.io-client'
          }
        }
      },
      xhr: {
        src: [],
        dest: 'public/build/xhr.js',
        options: {
          alias: {
            xhr: './node_modules/xhr'
          }
        }
      },
      pixi: {
        src: [],
        dest: 'public/build/pixi.js',
        options: {
          alias: {
            pixi: './src/client/pixi.js'
          },
          transform: ['brfs']
        }
      },
      engine: {
        src: [],
        dest: 'public/build/engine.js',
        options: {
          external: ['pixi', 'socket'],
          alias: {
            engine: '../solarcrusaders/src/client/engine/index.js'
          },
          transform: ['brfs'],
          plugin: [require('bundle-collapser/plugin')]
        }
      },
      solar: {
        src: [],
        dest: 'public/build/solar.js',
        options: {
          external: ['pixi', 'engine', 'xhr'],
          alias: {
            solar: '../solarcrusaders/src/client/solar.js'
          },
          transform: ['brfs'],
          plugin: [require('bundle-collapser/plugin')]
        }
      },
      client: {
        src: ['src/client/index.js'],
        dest: 'public/build/client.js',
        options: {
          external: ['pixi', 'engine', 'xhr', 'solar'],
          watch: true,
          transform: ['brfs']
        }
      }
    },

    'uglify': {
      options: {
        mangle: {
          screw_ie8: true
        },
        compress: {
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
          unsafe: true,
          conditionals : true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          cascade: true,
          side_effects: true,
          warnings: true
        }
      },
      dev: {
        files: {
          'public/build/solar.lib.js': [
            'public/build/engine.js',
            'public/build/solar.js'
          ]
        }
      }
    },

    'watch': {
      dev: {
        files: ['src/**/*', 'views/**/*', 'public/build/client.js'],
        tasks: ['develop:dev'],
        options: { nospawn: true }
      }
    },

    'develop': {
      dev: {
        file: 'app.js',
        env: { NODE_ENV: 'development' },
        nodeArgs: ['--debug']
      }//,
      // debug: {
      //   file: 'app.js',
      //   nodeArgs: ['--debug']
      // }
    }
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'browserify:socket',
    'browserify:xhr',
    'browserify:pixi',
    'browserify:client',
    'develop:dev',
    'watch:dev'
  ]);

  grunt.registerTask('build', [
    'browserify:engine',
    'browserify:solar',
    'uglify:dev'
  ]);
};
