var engine = require('engine'),
    solar = require('solar');
    
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.scrollVelocityX = 0;
  this.scrollVelocityY = 0;

  this.scrollLock = false;
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  var load = this.game.load;
      load.image('space', 'imgs/game/space/sector-a.jpg');
      load.image('station-ubaidian', 'imgs/game/stations/station-ubaidian-home.png');
};

// loadUpdate = function() {};
// loadRender = function() {};

SectorState.prototype.create = function() {
  var self = this,
      sensitivity = 1000,
      mouse = this.game.input.mouse;
      mouse.capture = true;
      mouse.mouseWheelCallback = function(event) {
        var delta = event.deltaY / sensitivity,
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.5, 1.1);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) { self.zoom.stop(); }
        this.world.scale.set(scale, scale);
      };

  // store gui reference
  this.gui = game.state.getBackgroundState('gui');

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(0.8, 0.8);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  this.stationManager = new solar.sector.StationManager(this.game);
  this.stationManager.boot();

  // gui
  this.gui.toggle(true);
};

SectorState.prototype.update = function() {
  var game = this.game,
      camera = game.camera,
      keyboard = game.input.keyboard,
      // timeStep = this.game.clock.elapsed,
      move = 1.04;// * timeStep;

  if(this.scrollLock) { return; }

  // add velocity on keypress
  if(keyboard.isDown(engine.Keyboard.A) || keyboard.isDown(engine.Keyboard.LEFT)) {
    this.scrollVelocityX += move;
  }
  if(keyboard.isDown(engine.Keyboard.D) || keyboard.isDown(engine.Keyboard.RIGHT)) {
    this.scrollVelocityX -= move;
  }
  if(keyboard.isDown(engine.Keyboard.W) || keyboard.isDown(engine.Keyboard.UP)) {
    this.scrollVelocityY += move;
  }
  if(keyboard.isDown(engine.Keyboard.S) || keyboard.isDown(engine.Keyboard.DOWN)) {
    this.scrollVelocityY -= move;
  }

  // apply velocity
  camera.pan(this.scrollVelocityX, this.scrollVelocityY);
  
  // apply friction
  if(this.scrollVelocityX > 0 || this.scrollVelocityX < 0) {
    this.scrollVelocityX /= 1.1;
  }
  if(this.scrollVelocityX > -0.05 && this.scrollVelocityX < 0.05) {
    this.scrollVelocityX = 0;
  }
  if(this.scrollVelocityY > 0 || this.scrollVelocityY < 0) {
    this.scrollVelocityY /= 1.1;
  }
  if(this.scrollVelocityY > -0.05 && this.scrollVelocityY < 0.05) {
    this.scrollVelocityY = 0;
  }
};

// preRender = function() {};

// render = function() {};

SectorState.prototype.resize = function(width, height) {

};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {};

module.exports = SectorState;
