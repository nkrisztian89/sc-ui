
var engine = require('engine'),
	Panel = require('../Panel'),
	Label = require('./Label'),
	Layout = require('../Layout'),
	BorderLayout = require('../layouts/BorderLayout'),
	StackLayout = require('../layouts/StackLayout'),
	RasterLayout = require('../layouts/RasterLayout'),
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
		message: {
			padding: [9],
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
		direction: Tooltip.LEFT
	});
	
	// determine style for arrow
	this.settings.arrow.sh = this.settings.message.bg;
	this.settings.arrow.size += this.settings.arrow.sh.borderSize;
	this.settings.arrow.direction = this.settings.direction;

	// message init
	this.message = new Label(game, string, this.settings.message);
	
	// arrow and arrowPanel init
	this.arrow = new Arrow(game, this.settings.arrow);
	this.arrowPanel = new Panel(game, new StackLayout());
	this.arrowPanel.addPanel(Layout.USE_PS_SIZE, this.arrow);

	this.visible = false;
	
	// event handling
	if(!component.bg.inputEnabled) {
		component.bg.inputEnabled = true;
		component.bg.input.priorityID = 2;
		component.bg.alpha = 0.75;
	}
	
	component.bg.on('inputOver', this._inputOver, this);
	component.bg.on('inputOut', this._inputOut, this);
	
	// build tooltip
	this.addPanel(Layout.CENTER, this.message);
	this.addPanel(this.getLayoutConstraint(), this.arrowPanel);
	
	// attach tooltip to parent
	this.raster = new Panel(game, new RasterLayout());
	this.raster.setPadding(0);
	this.raster.addPanel(Layout.NONE, this);
	component.addPanel(Layout.USE_PS_SIZE, this.raster);
	
	this.determineSize();
	this.place();
}

Tooltip.prototype = Object.create(Panel.prototype);
Tooltip.prototype.constructor = Tooltip;

Tooltip.prototype._inputOver = function() {
	this.visible = true;
	this.invalidate();
};

Tooltip.prototype._inputOut = function() {
	this.visible = false;
	this.invalidate();
};

Tooltip.prototype.place = function() {
	var toolPS = this.getPreferredSize(),
		rasterPS = this.parent.getPreferredSize(),
		compPD = this.parent.parent.padding,
		loc;
	switch(this.settings.direction) {
		case Tooltip.UP:
			loc = {x: (rasterPS.width - toolPS.width)/2, y: rasterPS.height + compPD.bottom};
			break;
		case Tooltip.LEFT:
			loc = {x: rasterPS.width + compPD.right, y: (rasterPS.height - toolPS.height)/2};
			break;
		case Tooltip.DOWN:
			loc = {x: (rasterPS.width - toolPS.width)/2, y: -toolPS.height - compPD.top};
			break;
		case Tooltip.RIGHT:
			loc = {x: -toolPS.width - compPD.left, y: (rasterPS.height - toolPS.height)/2};
			break;
		default:
			throw new Error("Invalid Direction");
	}
	this.setLocation(loc.x, loc.y);
};

// returns the correct layout constraint based on the direction
Tooltip.prototype.getLayoutConstraint = function() {
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

Tooltip.prototype.determineSize = function() {
	var compPS = this.parent.parent.getPreferredSize(),
		compPD = this.parent.parent.padding,
		ps = {
			width: compPS.width-compPD.left-compPD.right,
			height: compPS.height-compPD.top-compPD.bottom
		};
	this.raster.setPreferredSize(ps.width, ps.height);
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
	
	this.determineSize();
	
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
	
	this.back = new ShapeView(game, this.settings.back.sh);
	this.front = new ShapeView(game, this.settings.front.sh);
	
	// build arrow
	this.addView(this.back);
	this.addView(this.front);
}

Arrow.prototype = Object.create(Panel.prototype);
Arrow.prototype.constructor = Arrow;

// sets the minimum size required for the arrow
// size is adjusted for the shift of the arrows toward the center message label
Arrow.prototype.determineSize = function() {
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
