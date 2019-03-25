"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    eslint: {
      options: {
        configFile: ".eslintrc"
      },
      target: ["gruntfile.js", "source/**/custom*.js"]
    },

    stylelint: {
      options: {
        configFile: ".stylelintrc",
        formatter: "string",
        ignoreDisables: false,
        failOnError: true,
        outputFile: "",
        reportNeedlessDisables: false,
        syntax: ""
      },

      all: ["source/**/*.css"]
    },

    htmlhint: {
      options: {
        htmlhintrc: ".htmlhintrc"
      },
      html1: {
        src: ["source/**/*.html"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-stylelint");
  grunt.loadNpmTasks("grunt-htmlhint");

  grunt.registerTask("default", ["eslint", "stylelint", "htmlhint"]);
};
