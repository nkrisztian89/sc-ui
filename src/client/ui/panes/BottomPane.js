
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ProgressableButtonIcon = require('../components/ProgressableButtonIcon'),
    ToolTip = require('../components/ToolTip'),
    Class = engine.Class;

function BottomPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  // default styles
  this.settings = Class.mixin(settings, {
    width: 294,
    height: 42,
    padding: [3, 6],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [0,0],
      bg: {
        fillAlpha: 1,
        color: 0x0b3565,
        borderColor: 0x0d1321,
        radius: 0.0,
        borderSize: 3.0,
        blendMode: engine.BlendMode.NORMAL
      },
      layout: {
        direction: Layout.HORIZONTAL
      }
    }
  });

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.content = new Pane(game, this.settings.content);

  this.addView(this.bg);
  this.addPanel(Layout.CENTER, this.content);

  this.iconWithBar1 = new ProgressableButtonIcon(game, 'icon1', {width:30, height:30});
  this.iconWithBar1.on('inputUp', this._clicked1, this);
  this.content.addPanel(Layout.NONE, this.iconWithBar1);
  this.iconWithBar1.setProgressBar(0.3);

  this.toolTip = new ToolTip(game, {width:80, height:30});
  this.content.addPanel(Layout.NONE, this.toolTip);

}

BottomPane.prototype = Object.create(Panel.prototype);
BottomPane.prototype.constructor = BottomPane;

BottomPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

BottomPane.prototype._clicked1 = function() {
  this.iconWithBar1.setProgressBar( this.iconWithBar1.percentage / 100 + 0.2);
};

module.exports = BottomPane;
