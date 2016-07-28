
var engine = require('engine'),
	Panel = require('../Panel'),
	Label = require('./Label'),
	Layout = require('../Layout'),
	BorderLayout = require('../layouts/BorderLayout'),
	StackLayout = require('../layouts/StackLayout'),
	BackgroundView = require('../views/BackgroundView'),
	ShapeView = require('../views/ShapeView'),
	Point = engine.Point;
	Polygon = engine.Polygon;
	Class = engine.Class;

/* Tooltip Prototype - creates a Tooltip */
/**
 * TODO:
 *   - calculate appropriate location
 *   - animate tooltip on hover
**/
function Tooltip(game, string, component, settings) {
	Panel.call(this, game, new BorderLayout());

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
			padding: [8],
			bg: {
				fillAlpha: 1.0,
				color: 0x000000,
				borderAlpha: 1.0,
				borderColor: 0x3868B8,
				borderSize: 1.0,
				blendMode: engine.BlendMode.NORMAL,
				radius: 0.0
			},
			text: {
				fontName: 'medium',
				tint: 0xCCCCCC
			}
		},
		arrow: {
			size: 8
		},
		direction: Tooltip.UP
	});
	
	// determine style for arrow
	this.settings.arrow.sh = this.settings.message.bg;
	this.settings.arrow.size += this.settings.arrow.sh.borderSize;
	this.settings.arrow.direction = this.settings.direction;
	
	// outer panel style
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);

	// message init
	this.message = new Label(game, string, this.settings.message);
	
	// arrow and arrowPanel init
	this.arrow = new Arrow(game, this.settings.arrow);
	this.arrowPanel = new Panel(game, new StackLayout());
	this.arrowPanel.addView(new BackgroundView(game, {
		fillAlpha: 0.0,
		color: 0x000000,
		borderSize: 0.0,
		radius: 0.0
	}));
	this.arrowPanel.addPanel(Layout.USE_PS_SIZE, this.arrow);

	this.bg = new BackgroundView(game, this.settings.bg);
	this.bg.inputEnabled = true;
	this.bg.input.priorityID = 2;
	this.bg.alpha = 0.75;
	
	// event handling
	this.parent = component;
	this.parent.on('inputOver', this._inputOver, this);
	this.parent.on('inputOut', this._inputOut, this);
	
	console.log("Component: %o", this.parent);
	console.log("x: %d | y: %d", this.parent.x, this.parent.y);
	
	// build tooltip
	this.addView(this.bg);
	this.addPanel(Layout.CENTER, this.message);
	this.addPanel(this.getBorderLayoutConstraint(), this.arrowPanel);
}

Tooltip.prototype = Object.create(Panel.prototype);
Tooltip.prototype.constructor = Tooltip;

Tooltip.prototype.on = function(name, callback, context) {
	this.bg.on.call(this.bg, name, callback, context);
};

Tooltip.prototype._inputOver = function() {
	this.bg.alpha = 1.0;
	this.bg.tint = 0xFF0000;
	console.log("InputOver() called");
};

Tooltip.prototype._inputOut = function() {
	this.bg.alpha = 1.0;
	this.bg.tint = 0x00FF00;
	console.log("InputOut() called");
};

// returns the correct BorderLayout constraint based on the direction
Tooltip.prototype.getBorderLayoutConstraint = function() {
	switch(this.settings.direction) {
		case Tooltip.UP:
			return Layout.TOP;
		case Tooltip.LEFT:
			return Layout.LEFT;
		case Tooltip.DOWN:
			return Layout.BOTTOM;
		case Tooltip.RIGHT:
			return Layout.RIGHT;
		default:
			throw new Error("Invalid Direction");
	}
};

// directional constants to place Tooltip (relative to parent)
// currently these are used to place an arrow facing the specified direction
/** TODO:
 *   - use to determine where to place tooltip relative to parent (opposite direction)
**/
Tooltip.UP = 1;
Tooltip.LEFT = 2;
Tooltip.DOWN = 3;
Tooltip.RIGHT = 4;

/* Arrow Prototype - uses two ShapeViews to draw an arrow with a border */
function Arrow(game, settings) {
	Panel.call(this, game);
	
	this.settings = Class.mixin(settings, {
		padding: [0],
		border: [0],
		size: 0.0,
		sh: {
			fillAlpha: 0.0,
			color: 0x000000,
			borderAlpha: 0.0,
			borderColor: 0x000000,
			borderSize: 0.0,
		},
		direction: Tooltip.UP
	});
	
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);
	
	this.setDeterminedSize();
	
	this.settings.back = {
		sh: {
			fillAlpha: this.settings.sh.borderAlpha,
			color: this.settings.sh.borderColor,
			shape: this.makeShape(this.settings.size)
		}
	};
	this.settings.front = {
		sh: {
			fillAlpha: this.settings.sh.fillAlpha,
			color: this.settings.sh.color,
			shape: this.makeShape(this.settings.size - this.settings.sh.borderSize)
		}
	}
	this.centerShape(this.settings.front.sh.shape, this.settings.sh.borderSize);
	
	// build arrow
	this.addView(new ShapeView(game, this.settings.back.sh));
	this.addView(new ShapeView(game, this.settings.front.sh));
}

Arrow.prototype = Object.create(Panel.prototype);
Arrow.prototype.constructor = Arrow;

// sets the minimum size required for the arrow
// size is adjusted for the shift of the arrows toward the center message label
Arrow.prototype.setDeterminedSize = function() {
	var size = this.settings.size,
		offset = Math.round(this.settings.sh.borderSize/2),
		ps;
	switch(this.settings.direction) {
		case Tooltip.UP:
		case Tooltip.DOWN:
			ps = {width: size*2, height: size-offset};
			break;
		case Tooltip.LEFT:
		case Tooltip.RIGHT:
			ps = {width: size-offset, height: size*2};
			break;
		default:
			throw new Error("Invalid Direction");
	}
	this.setPreferredSize(ps.width, ps.height);
};

Arrow.prototype.shiftShape = function (shape, axis, offset) {
	for(var i = 0; i < shape.length; i++)
		shape[i][axis] += offset;
};

// centers front arrow to align with back arrow (border)
Arrow.prototype.centerShape = function(shape, scale) {
	var axis;
	switch(this.settings.direction) {
		case Tooltip.UP:
		case Tooltip.DOWN:
			axis = 'x';
			break;
		case Tooltip.LEFT:
		case Tooltip.RIGHT:
			axis = 'y';
			break;
		default:
			throw new Error("Invalid Direction");
	}
	this.shiftShape(shape, axis, scale);
};

// creates arrow shapes and aligns them relative to the Label at the center
Arrow.prototype.makeShape = function(size) {
	var shapeOffset = this.settings.size - size,
		positionOffset = Math.round(this.settings.sh.borderSize/2);
	switch(this.settings.direction) {
		case Tooltip.UP:
			return [
				new Point(0, size+shapeOffset),
				new Point(size, shapeOffset),
				new Point(size*2, size+shapeOffset)
			];
		case Tooltip.LEFT:
			return [
				new Point(size+shapeOffset, 0),
				new Point(shapeOffset, size),
				new Point(size+shapeOffset, size*2)
			];
		case Tooltip.DOWN:
			return [
				new Point(0, -positionOffset),
				new Point(size, size-positionOffset),
				new Point(size*2, -positionOffset)
			];
		case Tooltip.RIGHT:
			return [
				new Point(-positionOffset, 0),
				new Point(size-positionOffset, size),
				new Point(-positionOffset, size*2)
			];
		default:
			throw new Error("Invalid Direction");
	}
};

module.exports = Tooltip;