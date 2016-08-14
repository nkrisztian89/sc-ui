
var engine = require('engine'),
	Panel = require('../Panel'),
	Label = require('./Label'),
	Layout = require('../Layout'),
	BorderLayout = require('../layouts/BorderLayout'),
	RasterLayout = require('../layouts/RasterLayout'),
	BackgroundView = require('../views/BackgroundView'),
	ShapeView = require('../views/ShapeView'),
	Point = engine.Point;
	Class = engine.Class;

/* Tooltip Prototype - creates a Tooltip */
function Tooltip(game, string, component, settings) {
	Panel.call(this, game, new BorderLayout());

	// default styles
	this.settings = Class.mixin(settings, {
		padding: [0],
		border: [0],
		message: {
			padding: [9],
			border: [0],
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
		}
	});
	
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);
	
	this.visible = false;
	this.alpha = 1.0;
	
	this.message = new Label(game, string, this.settings.message);
	
	// determine style for arrow
	this.settings.arrow.sh = this.settings.message.bg;
	this.settings.arrow.size += this.settings.arrow.sh.borderSize;
	
	this.arrow = new Arrow(game, this.settings.arrow);
	this.arrowPanel = new Panel(game);
	this.arrowPanel.addPanel(Layout.USE_PS_SIZE, this.arrow);
	
	// build tooltip
	this.addPanel(Layout.CENTER, this.message);
	this.addPanel(Layout.CENTER, this.arrowPanel);
	this.attachTo(component);
}

Tooltip.prototype = Object.create(Panel.prototype);
Tooltip.prototype.constructor = Tooltip;

Tooltip.prototype._inputOver = function() {
	var direction = this.determineDirection();
	if(direction !== this.settings.direction)
		this.readjust(direction);
	this.visible = true;
	this.invalidate();
};

Tooltip.prototype._inputOut = function() {
	this.visible = false;
	this.invalidate();
};

// adds tooltip to component
Tooltip.prototype.attachTo = function(component) {
	this.component = component;
	this.raster = new Panel(game, new RasterLayout());
	
	// event handling
	if(!this.component.bg.inputEnabled) {
		this.component.bg.inputEnabled = true;
		this.component.bg.input.priorityID = 2;
		this.component.bg.alpha = 0.75;
	}
	
	this.component.bg.on('inputOver', this._inputOver, this);
	this.component.bg.on('inputOut', this._inputOut, this);
	
	// add panels and place tooltip
	this.raster.addPanel(Layout.NONE, this);
	this.component.addPanel(Layout.NONE, this.raster);
}

// repositions and redirects tooltip according to the new direction
Tooltip.prototype.readjust = function(direction) {
	var rasterPS = this.calcPreferredSize(),
		loc;
	this.settings.direction = direction;
	this.arrowPanel.constraint = this.getLayoutConstraint(direction);
	this.arrow.readjust(direction);
	this.raster.setPreferredSize(rasterPS.width, rasterPS.height);
	loc = this.calcLocation(direction);
	this.setLocation(loc.x, loc.y);
};

// returns the correct layout constraint based on the direction
Tooltip.prototype.getLayoutConstraint = function(direction) {
	switch(direction) {
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

// determines where the Tooltip should be located based on direction
Tooltip.prototype.calcLocation = function(direction) {
	var toolPS = this.getPreferredSize(),
		rasterPS = this.raster.getPreferredSize(),
		compPD = this.component.padding;
	switch(direction) {
		case Tooltip.UP:
			return {x: (rasterPS.width - toolPS.width)/2, y: rasterPS.height + compPD.bottom};
		case Tooltip.LEFT:
			return {x: rasterPS.width + compPD.right, y: (rasterPS.height - toolPS.height)/2};
		case Tooltip.DOWN:
			return {x: (rasterPS.width - toolPS.width)/2, y: -toolPS.height - compPD.top};
		case Tooltip.RIGHT:
			return {x: -toolPS.width - compPD.left, y: (rasterPS.height - toolPS.height)/2};
		default:
			throw new Error("Invalid Direction");
	}
};

// determines the correct size for the raster panel to fit inside its parent
Tooltip.prototype.calcPreferredSize = function() {
	var compPS = this.component.getPreferredSize(),
		compPD = this.component.padding;
	return {
		width: compPS.width - compPD.left - compPD.right,
		height: compPS.height - compPD.top - compPD.bottom
	};
};

// calculates which direction the Tooltip should face based on available space
Tooltip.prototype.determineDirection = function() {
	var windowDim = {
			width: window.innerWidth || document.documentElement.clientWidth ||
				document.body.clientWidth,
			height: window.innerHeight || document.documentElement.clientHeight ||
				document.body.clientHeight
		},
		absLocation = this.component.getAbsoluteLocation(),
		spaceUp = absLocation.y,
		spaceDown = windowDim.height - (spaceUp + this.component.width),
		spaceLeft = absLocation.x,
		spaceRight = windowDim.width - (spaceLeft + this.component.height),
		direction;
	
	if(global.Math.max(spaceUp, spaceDown) >= global.Math.max(spaceLeft, spaceRight)) {
		if(spaceUp >= spaceDown)
			direction = Tooltip.DOWN;
		else
			direction = Tooltip.UP;
	}
	else {
		if(spaceLeft >= spaceRight)
			direction = Tooltip.RIGHT;
		else
			direction = Tooltip.LEFT;
	}
	return direction;
};

// directional constants to place Tooltip (relative to parent)
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
		}
	});
	
	this.setPadding.apply(this, this.settings.padding);
	this.setBorder.apply(this, this.settings.border);
	
	this.settings.back = {
		sh: {
			fillAlpha: this.settings.sh.borderAlpha,
			color: this.settings.sh.borderColor
		}
	};
	this.settings.front = {
		sh: {
			fillAlpha: this.settings.sh.fillAlpha,
			color: this.settings.sh.color
		}
	}
	
	this.back = new ShapeView(game, this.settings.back.sh);
	this.front = new ShapeView(game, this.settings.front.sh);
	
	// build arrow
	this.addView(this.back);
	this.addView(this.front);
}

Arrow.prototype = Object.create(Panel.prototype);
Arrow.prototype.constructor = Arrow;

// repositions and redirects arrow according to the new direction
Arrow.prototype.readjust = function(direction) {
	var ps = this.calcPreferredSize(direction);
	this.settings.direction = direction;
	this.setPreferredSize(ps.width, ps.height);
	this.back.settings.shape = this.makeShape(this.settings.size);
	this.front.settings.shape = this.makeShape(this.settings.size - this.settings.sh.borderSize);
	this.centerShape(this.front.settings.shape, this.settings.sh.borderSize);
};

// sets the minimum size required for the arrow
// size is readjusted for the shift of the arrows toward the center message label
Arrow.prototype.calcPreferredSize = function(direction) {
	var size = this.settings.size,
		offset = global.Math.round(this.settings.sh.borderSize/2);
	switch(direction) {
		case Tooltip.UP:
		case Tooltip.DOWN:
			return {width: size*2, height: size-offset};
		case Tooltip.LEFT:
		case Tooltip.RIGHT:
			return {width: size-offset, height: size*2};
		default:
			throw new Error("Invalid Direction");
	}
};

// shifts the given shape along an axis using the given offset
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
		positionOffset = global.Math.round(this.settings.sh.borderSize/2);
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
