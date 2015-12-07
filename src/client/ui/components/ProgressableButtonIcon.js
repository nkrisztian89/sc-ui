
var engine = require('engine'),
    ButtonIcon = require('./ButtonIcon'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Panel = require('../Panel'),
    Class = engine.Class;

function ProgressableButtonIcon(game, key, settings) {
  ButtonIcon.call(this, game, key, 
    Class.mixin(settings, {
        padding: [0,0, 0, 5],
      icon:{bg:{borderSize: 0.0}}
    })
 );
   //this.setPadding.apply(this, [0]);
  if(this.settings.width) {
    this.width = this.settings.width;
  }
  if(this.settings.height) {
    this.height = this.settings.height;
  }

  this.decimal = 0.0; 

  this.progress = new BackgroundView(game,
    Class.mixin(this.settings.progress, {
      size: { width: 4, height: 0},
      color: 0x09346b,
      borderSize: 0.0
    }
  ));

  this.progressBg = new BackgroundView(game,
    Class.mixin(this.settings.progress, {
      size: { width: 4, height: this.height + 4},
      color: 0xffffff,
      borderSize: 0.0
    }
  ));

  this.progressBg.x = this.progress.x = this.width + 6;
  this.progressBg.y = this.progress.y = 2;

  this.addView(this.progressBg);
  this.addView(this.progress);
};

ProgressableButtonIcon.prototype = Object.create(ButtonIcon.prototype);
ProgressableButtonIcon.prototype.constructor = ProgressableButtonIcon;

ProgressableButtonIcon.prototype.setProgressBar = function(decimal) {
  var progress = this.progress;
      progress.settings.size.height = this.settings.height * (1 - Math.min(1, decimal));
  this.decimal = decimal;
};

module.exports = ProgressableButtonIcon;
