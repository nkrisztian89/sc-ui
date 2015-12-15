
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

function ToolTip(game, text, settings) {
  settings = settings || {};
  this.toolTipPosition = settings.position || Layout.RIGHT;
  var padding = [0];
  var direction = Layout.HORIZONTAL;
  switch (this.toolTipPosition) {
    case Layout.RIGHT:
      padding = [1, 0, 1, 1];
      break;
    case Layout.LEFT:
      padding = [1, 1, 1, 0];
      break;
    case Layout.TOP:
      direction = Layout.VERTICAL;
      padding = [1, 1, 0, 1];
      break;
    case Layout.BOTTOM:
      padding = [0, 1, 1, 1];
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
        direction: Layout.VERTICAL
      }
    },    
    title: {
      padding: [4],
      border: [0],
      text: {
        tint: 0xFF3366,
        fontName: 'medium'
      },
      bg: {
        color: 0x000000,
        fillAlpha: 1.0,
        borderSize: 0
      }
    },
    message: {
      padding: [12, 4, 12, 4],
      border: [0],
      text: {
        fontName: 'medium',
        characterSpacing: 1,
        lineSpacing: 4
      },
      bg: {
        color: 0x000000,
        fillAlpha: 1.0,
        borderSize: 0
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

//  this.bg = new BackgroundView(game, this.settings.bg);
  this.title = new Label(game, 'ToolTip', this.settings.title);
  this.message = new Label(game, '', this.settings.message);

  this.content.addPanel(Layout.STRETCH, this.title);
  this.content.addPanel(Layout.USE_PS_SIZE, this.message);
 
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

  this.title.text =  'ToolTip';
  this.message.text = text;


  this.arrowGraphics = new engine.Graphics();
  
  // add it the stage so we see it on our screens..
  this.arrow.addChild(this.arrowGraphics);


  this.game.emit('gui/modal', true, this, true);
};


ToolTip.prototype = Object.create(Pane.prototype);
ToolTip.prototype.constructor = ToolTip;

ToolTip.prototype.resize = function(width, height) {
  this.arrowGraphics.beginFill(0x0000);
  this.arrowGraphics.lineStyle(10, 0x3868b8);
  switch (this.toolTipPosition) {
    case Layout.LEFT:
      this.arrowGraphics.moveTo(0, 0);
      this.arrowGraphics.lineTo(this.arrow.psWidth, height / 2);
      this.arrowGraphics.lineTo(0, height);
       this.arrowGraphics.moveTo(0, 0);
     break;
    case Layout.RIGHT:
      this.arrowGraphics.moveTo(this.arrow.psWidth + 10, 0);
      this.arrowGraphics.lineTo(0, height / 2);
      this.arrowGraphics.lineTo(this.arrow.psWidth + 10, height);
      this.arrowGraphics.moveTo(this.arrow.psWidth + 10, 0);
      break;
    case Layout.TOP:
      this.arrowGraphics.moveTo(0, 0);
      this.arrowGraphics.lineTo(width / 2, this.arrow.psHeight + 10);
      this.arrowGraphics.lineTo(width, 0);
      this.arrowGraphics.moveTo(0, 0);
      break;
    case Layout.BOTTOM:
      this.arrowGraphics.moveTo(0, this.arrow.psHeight + 10);
      this.arrowGraphics.lineTo(width / 2, 0);
      this.arrowGraphics.lineTo(width, this.arrow.psHeight + 10);
      this.arrowGraphics.moveTo(0, this.arrow.psHeight + 10);
      break;
  }
  this.arrowGraphics.endFill();
};

ToolTip.prototype._close = function() {
  this.game.emit('gui/modal', false);
};

module.exports = ToolTip;
