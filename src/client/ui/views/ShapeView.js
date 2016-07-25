
var engine = require('engine'),
	View = require('../View'),
	Graphics = engine.Graphics,
	Point = engine.Point,
	Class = engine.Class;

function ShapeView(game, settings) {
	Graphics.call(this, game);
	View.call(this);

	this.settings = Class.mixin(settings, {
		shape: [new Point(0, 0)],
		color: 0x000000,
		fillAlpha: 1.0,
		borderSize: 1.0,
		borderColor: 0x000000,
		borderAlpha: 1.0,
		blendMode: engine.BlendMode.NORMAL,
	});

	this.fillAlpha = this.settings.fillAlpha;
	this.blendMode = this.settings.blendMode;
};

// multiple inheritence
ShapeView.prototype = Object.create(Graphics.prototype);
ShapeView.prototype.mixinPrototype(View.prototype);
ShapeView.prototype.constructor = ShapeView;

ShapeView.prototype.paint = function(top, left, bottom, right) {
	var points = settings.shape;
	
	if(settings.borderSize > 0 && settings.borderAlpha > 0) {
		this.lineStyle(settings.borderSize, settings.borderColor, settings.borderAlpha);
	}
	if(settings.fillAlpha > 0) {
		this.beginFill(settings.color, settings.fillAlpha);
	}
	if(settings.fillAlpha > 0 || (settings.borderSize > 0 && settings.borderAlpha > 0)) {
		this.drawPolygon(points);
	}
	if(settings.fillAlpha > 0) {
		this.endFill();
	}
		
};

module.exports = ShapeView;
