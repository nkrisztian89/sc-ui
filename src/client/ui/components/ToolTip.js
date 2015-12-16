
var engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Button = require('../components/Button'),
    BorderLayout = require('../layouts/BorderLayout'),
    FlowLayout = require('../layouts/FlowLayout'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ToolTip(game, settings) {
  settings = settings || {};
  this.toolTipPosition = settings.position || Layout.RIGHT;
  var padding = [0];
  var direction = Layout.HORIZONTAL;
  switch (this.toolTipPosition) {
    case Layout.RIGHT:
      padding = [4, 0, 1, 1];
      break;
    case Layout.LEFT:
      padding = [1, 4, 1, 0];
      break;
    case Layout.TOP:
      direction = Layout.VERTICAL;
      padding = [4, 1, 0, 1];
      break;
    case Layout.BOTTOM:
      padding = [0, 4, 1, 1];
      direction = Layout.VERTICAL;
      break;
  }
  Pane.call(this, game, {
    padding: [0],
    border: [0],
    layout: { gap: 0,
     direction: direction
    },
    bg: {
       padding: padding,
      fillAlpha: 0.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [0,0],
      bg: {
        fillAlpha: 1,
        color: 0x0000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.NORMAL
      },
      layout: {
        direction: Layout.HORIZONTAL
      }
    }
  });

  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.contentAsBorder = new Pane(game, this.settings.bg);
  var bgSettings = {bg: {
      fillAlpha: 0.0,
      color: 0x000000,
      borderSize: 0.0,
      borderColor: 0x000000,
      radius: 0}};

  if ((this.toolTipPosition === Layout.TOP) || (this.toolTipPosition === Layout.BOTTOM)) {
    bgSettings.height = 30;
  }
  if ((this.toolTipPosition === Layout.LEFT) || (this.toolTipPosition === Layout.RIGHT)) {
    bgSettings.width = 30;
  }
  this.arrow = new Pane(game, bgSettings);
  this.content = new Pane(game, this.settings.content);

 this.contentAsBorder.addPanel(Layout.STRETCH, this.content);

   switch (this.toolTipPosition) {
    case Layout.RIGHT:
      this.addPanel(Layout.STRETCH, this.arrow);
      this.addPanel(Layout.STRETCH, this.contentAsBorder);
      break;
    case Layout.LEFT:
      this.addPanel(Layout.STRETCH, this.contentAsBorder);
      this.addPanel(Layout.STRETCH, this.arrow);
      break;
    case Layout.TOP:
      this.addPanel(Layout.STRETCH, this.contentAsBorder);
      this.addPanel(Layout.STRETCH, this.arrow);
      break;
    case Layout.BOTTOM:
      this.addPanel(Layout.STRETCH, this.arrow);
      this.addPanel(Layout.STRETCH, this.contentAsBorder);
      break;
  }
  this.arrowGraphics = new engine.Graphics();
  this.arrow.addChild(this.arrowGraphics);


  this.game.emit('gui/modal', true, this, true);
};


ToolTip.prototype = Object.create(Pane.prototype);
ToolTip.prototype.constructor = ToolTip;

ToolTip.prototype.resize = function(width, height) {
  this.arrowGraphics.beginFill(0x0000);
  var borderOverlap = 2;
  switch (this.toolTipPosition) {
    case Layout.LEFT:
      this.arrowGraphics.lineStyle(0, 0x3868b8);
      this.arrowGraphics.moveTo(-3 * borderOverlap, 0);
      this.arrowGraphics.lineTo(this.arrow.psWidth - 3 * borderOverlap, height / 2);
      this.arrowGraphics.lineTo(-3 * borderOverlap, height);
      this.arrowGraphics.endFill();
      this.arrowGraphics.beginFill(0x0000);
      this.arrowGraphics.lineStyle(1, 0x3868b8);
      this.arrowGraphics.moveTo(-3 * borderOverlap, 0);
      this.arrowGraphics.lineTo(this.arrow.psWidth - 3 * borderOverlap, height / 2);
      this.arrowGraphics.lineTo(-3 * borderOverlap, height);
      this.arrowGraphics.lineTo(this.arrow.psWidth - 3 * borderOverlap, height / 2);
     break;
    case Layout.RIGHT:
      this.arrowGraphics.lineStyle(1, 0x3868b8);
      this.arrowGraphics.moveTo(this.arrow.psWidth + borderOverlap, 0);
      this.arrowGraphics.lineTo(0, height / 2);
      this.arrowGraphics.lineTo(this.arrow.psWidth + borderOverlap, height);
      break;
    case Layout.TOP:
      this.arrowGraphics.lineStyle(0, 0x3868b8);
      this.arrowGraphics.moveTo(0, -2 * borderOverlap);
      this.arrowGraphics.lineTo(width / 2, this.arrow.psHeight - 2 * borderOverlap);
      this.arrowGraphics.lineTo(width, -2 * borderOverlap);
      this.arrowGraphics.endFill();
      this.arrowGraphics.lineStyle(1, 0x3868b8);
      this.arrowGraphics.moveTo(0, -2 * borderOverlap);
      this.arrowGraphics.lineTo(width / 2, this.arrow.psHeight - 2 * borderOverlap);
      this.arrowGraphics.lineTo(width, -2 * borderOverlap);
      this.arrowGraphics.lineTo(width / 2, this.arrow.psHeight - 2 * borderOverlap);
      break;
    case Layout.BOTTOM:
      this.arrowGraphics.lineStyle(1, 0x3868b8);
      this.arrowGraphics.moveTo(0, this.arrow.psHeight + borderOverlap);
      this.arrowGraphics.lineTo(width / 2, 0);
      this.arrowGraphics.lineTo(width, this.arrow.psHeight + borderOverlap);
      break;
  }
  this.arrowGraphics.endFill();
};

ToolTip.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
  this.invalidate();
};

module.exports = ToolTip;
