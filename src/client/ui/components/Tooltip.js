
var engine = require('engine'),
	Panel = require('../Panel'),
	Label = require('./Label'),
	Layout = require('../Layout'),
	BorderLayout = require('../layouts/BorderLayout'),
	StackLayout = require('../layouts/StackLayout'),
	BackgroundView = require('../views/BackgroundView'),
	Class = engine.Class;

function Tooltip(game, string, component, settings) {
	Panel.call(this, game, new BorderLayout());

	var messageBorderSize = 1.0,
		arrowSize = 5.0;

	// default styles
	this.settings = Class.mixin(settings, {
		padding: [0],
		border: [0],
		bg: {
			fillAlpha: 0.0,
			color: 0x000000,
			borderSize: 0.0,
			blendMode: engine.BlendMode.ADD,
			radius: 0.0
		},
		message: {
			bg: {
				fillAlpha: 1.0,
				color: 0x000000,
				borderColor: 0x3868B8,
				borderSize: messageBorderSize,
				radius: 0.0
			}
		},
		frontarrow: {
			bg: {
				fillAlpha: 1.0,
				borderColor: 0x000000,
				borderSize: arrowSize,
				radius: 0.0
			}
		},
		backarrow: {
			bg: {
				fillAlpha: 1.0,
				borderColor: 0x3868B8,
				borderSize: arrowSize+messageBorderSize,
				radius: 0.0
			}
		}
	});

	// style
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);

	this.message = new Label(game, string, this.settings.message);
	this.message.borderSize = this.settings.message.bg.borderSize;
	this.message.alpha = 0.9;

	this.frontarrow = new Arrow(game, this.settings.frontarrow);
	this.backarrow = new Arrow(game, this.settings.backarrow);

	this.arrowPanel = new ArrowPanel(game);

	console.log(this.frontarrow);

	this.bg = new BackgroundView(game, this.settings.bg);
	this.bg.inputEnabled = true;
	this.bg.input.priorityID = 2;
	this.bg.alpha = 0.75;

	// event handling
	component.on('inputOver', this._inputOver, this);
	component.on('inputOut', this._inputOut, this);

	// build tooltip
	this.addView(this.bg);
	this.arrowPanel.addPanel(Layout.NONE, this.backarrow);
	this.arrowPanel.addPanel(Layout.NONE, this.frontarrow);
	this.addPanel(Layout.CENTER, this.message);
	this.addPanel(Layout.TOP, this.arrowPanel);
}

Tooltip.prototype = Object.create(Panel.prototype);
Tooltip.prototype.constructor = Tooltip;

Tooltip.prototype.on = function(name, callback, context) {
	this.bg.on.call(this.bg, name, callback, context);
};

Tooltip.prototype._inputOver = function() {
	this.message.bg.tint = 0xFF0000;
};

Tooltip.prototype._inputOut = function() {
	this.message.bg.tint = 0x00FF00;
};

Tooltip.UP = 1;
Tooltip.LEFT = 2;
Tooltip.DOWN = 3;
Tooltip.RIGHT = 4;

function Arrow(game, settings) {
	Panel.call(this, game);
	
	this.settings = Class.mixin(settings, {
		padding: [0],
		border: [0, 0, 0, 0],
		bg: {}
	});

	this.settings.bg.borderColor = settings.bg.borderColor || 0x000000;
	this.settings.bg.borderSize = settings.bg.borderSize || 0.0;
	this.direction = settings.direction || Tooltip.UP;
	this.settings.border[this.getBorderSide()-1] = this.settings.bg.borderSize;
	
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);
	this.setSize(this.settings.bg.borderSize, this.settings.bg.borderSize);
	
	//delete this.settings.bg.borderSize;
	
	this.bg = new BackgroundView(game, this.settings.bg);

	this.addView(this.bg);
}

Arrow.prototype = Object.create(Panel.prototype);
Arrow.prototype.constructor = Arrow;

Arrow.prototype.getBorderSide = function() {
	switch(this.direction)
	{
		case Tooltip.UP:
			return Tooltip.DOWN;
		case Tooltip.LEFT:
			return Tooltip.RIGHT;
		case Tooltip.DOWN:
			return Tooltip.TOP;
		case Tooltip.RIGHT:
			return Tooltip.LEFT;
		default:
			console.err("Invalid Direction");
	}
	return undefined;
};

function ArrowPanel(game, settings) {
	Panel.call(this, game, new StackLayout());
	
	this.settings = Class.mixin(settings, {
		padding: [0],
		border: [0],
		bg : {
			fillAlpha: 0.0,
			color: 0x000000,
			borderSize: 0.0,
			blendMode: engine.BlendMode.ADD,
			radius: 0.0
		}
	});
	
	this.bg = new BackgroundView(game, this.settings.bg);
	
	this.addView(this.bg);
}

ArrowPanel.prototype = Object.create(Panel.prototype);
ArrowPanel.prototype.constructor = ArrowPanel;

module.exports = Tooltip;