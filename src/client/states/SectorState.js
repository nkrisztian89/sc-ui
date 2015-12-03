var engine = require('engine'),
    solar = require('solar');
    
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.ships = [];
  
  this.scrollVelocityX = 0;
  this.scrollVelocityY = 0;

  this.scrollLock = false;
};

SectorState.prototype.preload = function() {
  this.game.load.image('vessel-x01', 'imgs/game/ships/vessel-x01.png');
  this.game.load.image('engine-glow', 'imgs/game/fx/engine-glow.png');
  this.game.load.image('laser-a', 'imgs/game/turrets/laser-a.png');
  this.game.load.image('vessel-x01-shields', 'imgs/game/ships/vessel-x01-shields.jpg');
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');
};

// loadUpdate = function() {};
// loadRender = function() {};

SectorState.prototype.create = function() {
  var self = this,
      sensitivity = 1000,
      mouse = game.input.mouse;
      mouse.capture = true;
      mouse.mouseWheelCallback = function(event) {
        var delta = event.deltaY / sensitivity,
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.5, 1.2);
        this.world.scale.set(scale, scale);
      };

  // store gui reference
  this.gui = game.state.getBackgroundState('gui');

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(1.0, 1.0);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create ship manager
  this.shipManager = new solar.sector.ShipManager(this.game);
  this.shipManager.createShip({
    uuid: '1',
    username: 'neutrino',
    chasis: 'vessel-x01',
    throttle: 1.0,
    current: { x: 2048, y: 2048 },
    rotation: 0.0
  });

  // show gui
  this.gui && this.gui.toggle(true);
  this.game.emit('gui/message', 'ubaidia prime');
};

SectorState.prototype.update = function() {
  var game = this.game,
      camera = game.camera,
      keyboard = game.input.keyboard,
      // fix this :(
      // timeStep = this.game.clock.elapsedMS / 1000,
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
  camera.view.x -= this.scrollVelocityX;
  camera.view.y -= this.scrollVelocityY;
  
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
  if(this.background !== undefined) {
    this.background.resize(width, height);
  }
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  this.stage.removeChild(this.background);
  this.background.destroy();
};

module.exports = SectorState;
