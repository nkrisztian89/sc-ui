
var engine = require('engine'),
    PanelTest = require('../PanelTest'),
    Layout = require('../Layout'),
    FlowLayout = require('../layouts/FlowLayout'),
    BackgroundView = require('../views/BackgroundView'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function ToolTip(game, settings) {
  PanelTest.call(this, game, true);

  this.settings = Class.mixin(settings, {
    padding: [0],
    border: [1],
    layout: {
      ax: Layout.LEFT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 2.0
    }
  });

  // create layout
  this.layout = new FlowLayout(
    this.settings.layout.ax, this.settings.layout.ay,
    this.settings.layout.direction, this.settings.layout.gap);

  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width,
      this.settings.height);
  }

  // style
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  // build button
  //this.addView(new BackgroundView(game, this.settings.bg));

  this.bg = new BackgroundView(game, settings.bg);
  this.textView = new TextView(game, "string", settings.text);
  this.bg.y = -100;
  this.textView.y = -100;
  // create label
  this.addView(this.bg);
  this.addView(this.textView);

}

ToolTip.prototype = Object.create(PanelTest.prototype);
ToolTip.prototype.constructor = ToolTip;

module.exports = ToolTip;
