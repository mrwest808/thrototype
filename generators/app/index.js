'use strict';

var generators = require('yeoman-generator');
var say = require('yosay');
var chalk = require('chalk');


module.exports = generators.Base.extend({
  prompting: function() {
    var done = this.async();

    this.log(say(
      'Welcome to the ' + chalk.magenta('thrototype') + ' generator! ' +
      'The idea is to provide a "throw-away prototyping setup" ' +
      'intended to enable very quick prototyping, usually later ' +
      chalk.red('thrown out') + ' and ' + chalk.green('replaced') + ' by ' +
      'a more thought through architecture.'
    ));

    this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: 'thrototype'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description',
        default: ''
      },
      {
        type: 'confirm',
        name: 'includeLodash',
        message: 'Include lodash?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeJquery',
        message: 'Include jQuery?',
        default: false
      }
    ], function(answers) {
      this.answers = answers;
      done();
    }.bind(this));
  },

  writing: function() {
    var copy = function copy(templ, dest) {
      if (templ && !dest) {
        dest = templ;
      }

      return this.fs.copy(
        this.templatePath(templ),
        this.destinationPath(dest)
      );
    }.bind(this);

    var copyTpl = function copyTpl(templ, dest, opts) {
      return this.fs.copyTpl(
        this.templatePath(templ),
        this.destinationPath(dest),
        opts
      );
    }.bind(this);

    copy('_babelrc', '.babelrc');
    copy('_gitignore', '.gitignore');
    copy('gulpfile.babel.js');
    copy('src');

    copyTpl('README.md', 'README.md', {
      name: this.answers.name,
      description: this.answers.description
    });

    copyTpl('package.json', 'package.json', {
      name: this.answers.name,
      description: this.answers.description,
      includeLodash: this.answers.includeLodash,
      includeJquery: this.answers.includeJquery
    });
  },

  end: function() {
    this.log(
      'Run ' + chalk.magenta('npm i') + ' & ' +
      chalk.magenta('npm run dev') + ' to start developing!'
    );
  }
});
