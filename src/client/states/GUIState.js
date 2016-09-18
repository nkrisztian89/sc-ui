
var engine = require('engine'),

    Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),

    HeaderPane = require('../ui/panes/HeaderPane'),
    LeftPane = require('../ui/panes/LeftPane'),
    TopPane = require('../ui/panes/TopPane'), // renamed for clarity
    BottomPane = require('../ui/panes/BottomPane'),
    VitalsPane = require('../ui/panes/VitalsPane'),
    ShipPane = require('../ui/panes/ShipPane'),

    RightPane = require('../ui/panes/RightPane'),
    Leaderboard = require('../ui/components/Leaderboard'),

    Alert = require('../ui/components/Alert'),
    AlertMessage = require('../ui/components/AlertMessage'),
    Modal = require('../ui/components/Modal'),
    Selection = require('../ui/components/Selection'),

    RegistrationForm = require('../ui/html/RegistrationForm'),
    LoginForm = require('../ui/html/LoginForm');

function GUIState() {};

GUIState.DISCONNECT_MESSAGE = 'connection to the server has been lost\nattempting to reconnect';
GUIState.FPSPROBLEM_MESSAGE = 'the game will automatically adjust\nyour graphics settings';

GUIState.prototype = Object.create(engine.State.prototype);
GUIState.prototype.constructor = engine.State;

GUIState.prototype.init = function() {
  this.auth = this.game.auth;

  // add listeners
  this.game.on('gui/modal', this.modal, this);
};

GUIState.prototype.preload = function() {
  // load font
  this.game.load.image('vt323', 'imgs/game/fonts/vt323.png');
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');

  // load tilesets
  this.game.load.image('deck', 'imgs/game/tilesets/deck-mini.png');
  this.game.load.image('wall', 'imgs/game/tilesets/wall-mini.png');
  this.game.load.image('grid', 'imgs/game/tilesets/grid-mini.png');

  // the placeholder image for players showing up in the leaderboard who have no specific image set (empty or generic image)
  // this needs to be preloaded in any case
  this.game.load.image('user-placeholder', 'imgs/game/icons/icon-x01.png');
  // loading a sample image for text purposes
  // if players can choose from a set of images then those can be loaded here (e.g. from a tileset)
  // if uploading custom images is allowed, run-time asynchronous loading (with the placeholder showing until the actual image is loaded) needs to be implemented
  this.game.load.image('user1', 'imgs/game/turrets/laser-a.png');

  // load ship tilemap
  this.game.load.tilemap('ship-tilemap', 'data/ship-mini.json');

  // load ship configuration
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');

  // load texture atlas
  this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

  // spritesheet
  this.game.load.spritesheet('crew', 'imgs/game/spritesheets/crew-mini.png', 16, 16);
  this.game.load.spritesheet('door', 'imgs/game/spritesheets/door-mini.png', 16, 16);
};

GUIState.prototype.create = function() {
  var game = this.game;

  this.selection = new Selection(game);
  this.hud = new engine.Group(game);
  this.hud.visible = false;

  this.modalComponent = new Modal(game);
  this.modalComponent.visible = false;

  this.alertComponent = new Alert(game);
  this.alertMessageComponent = new AlertMessage(game);

  this.centerPanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel.setPadding(6);
  this.fullPanel = new Panel(game, new BorderLayout(0, 0)); // another panel stacked on top in stretch mode, which will house the leaderboard in the top-right corner
  this.leftPane = new LeftPane(game);

  //..
  // creating a list of sample "players" for testing the leaderboard
  // I implemented the leaderboard in a way it expects user objects having
  // name: string, kills: number and currency: number properties and optionally an imageKey: string property
  // (I could not find the real structure of the user object)
  // in production, the real user objects should be passed to it during run-time
  var players = [{
    name: 'laser joe',
    kills: 25,
    currency: 100,
    imageKey: 'user1'
  }, {
    name: 'user-with-a-very-long-name',
    kills: 2,
    currency: 1,
    imageKey: 'user1'
  }, {
    name: 'user without picture',
    currency: 8,
    kills: 10
  }, {
    name: 'loser Joe',
    kills: 0,
    currency: 0,
    imageKey: 'user1'
  }];

  // the (new) right pane contains the leaderboard, we pass it the initial list of sample players for testing
  this.rightPane = new RightPane(game, players);

  // original the right pane renamed to top pane for clarity, as it contains UI elements visible in the top-center area
  // we pass the leaderboard to it, as some test buttons were added to it invoking various leaderboard functionalities
  this.topPane = new TopPane(game, this.rightPane.leaderboard);
  // this.bottomPane = new BottomPane(game);
  // this.vitalsPane = new VitalsPane(game);

  // this.shipPanel = new Panel(game, new FlowLayout(Layout.LEFT, Layout.TOP, Layout.VERTICAL, 6));
  // this.shipPanel.setPadding(6);
  // this.shipPanel.addPanel(Layout.NONE,
  //   this.shipPane =
  //     new ShipPane(game, {
  //       player: true
  //     }));

  // this.targetPanel = new Panel(game, new FlowLayout(Layout.RIGHT, Layout.TOP, Layout.VERTICAL, 6));
  // this.targetPanel.setPadding(6);
  // this.targetPanel.addPanel(Layout.NONE,
  //   this.targetPane =
  //     new ShipPane(game, {
  //       player: false
  //     }));

  this.topPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.topPanel.addPanel(Layout.NONE, this.topPane);
  this.topPanel.visible = false;

  this.rightPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.VERTICAL, 6));
  this.rightPanel.addPanel(Layout.NONE, this.rightPane);

  // this.bottomPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.VERTICAL, 3));
  // this.bottomPanel.addPanel(Layout.NONE, this.bottomPane);
  // this.bottomPanel.addPanel(Layout.NONE, this.vitalsPane);
  // this.bottomPanel.visible = false;

  // this.centerPanel.addPanel(Layout.CENTER, this.shipPanel);
  this.centerPanel.addPanel(Layout.LEFT, this.leftPane);
  // this.centerPanel.addPanel(Layout.RIGHT, this.targetPanel);

  this.basePanel.addPanel(Layout.TOP, this.topPanel);
  // this.basePanel.addPanel(Layout.BOTTOM, this.bottomPanel);
  this.fullPanel.addPanel(Layout.RIGHT, this.rightPanel);

  this.root = new Panel(game, new StackLayout());
  this.root.setSize(game.width, game.height);
  this.root.visible = false;

  this.root.addChild(this.hud);

  this.root.addPanel(Layout.STRETCH, this.selection);
  this.root.addPanel(Layout.STRETCH, this.basePanel);
  this.root.addPanel(Layout.STRETCH, this.centerPanel);
  this.root.addPanel(Layout.STRETCH, this.fullPanel);
  this.root.addPanel(Layout.STRETCH, this.modalComponent);

  // add root to stage
  this.game.stage.addChild(this.root);

  // login
  this.login();

  this.auth.on('user', this.login, this);
  this.auth.on('disconnected', this._disconnected, this);

  this.game.on('gui/modal', this.modal, this);
  this.game.on('fpsProblem', this._fpsProblem, this);
  this.game.on('game/pause', this._pause, this);
};

GUIState.prototype.login = function() {
  // if(this.auth.isUser()) {
    this.centerPanel.visible = true;
    this.centerPanel.invalidate();
    // this.bottomPanel.visible = true;
    // this.bottomPanel.invalidate();
    this.topPanel.visible = true;
    this.topPanel.invalidate();
  // } else {
  //   this.bottomPanel.visible = false;
  //   this.centerPanel.visible = false;
    // this.registrationForm = new RegistrationForm(game);
    // this.loginForm = new LoginForm(game);
    // this.game.on('gui/loggedin', this._loggedin, this);
  // }
  if(this.modalComponent.visible) {
    this.modal(false);
  }
};

GUIState.prototype.refresh = function() {
  this.toggle(true);
};

GUIState.prototype.toggle = function(force) {
  this.hud.visible = this.root.visible =
    force !== undefined ? force : !this.root.visible;

  // repaint gui
  if(this.root.visible) {
    this.root.invalidate();
  }
};

GUIState.prototype.modal = function(show, content, lock, visible) {
  if(typeof show !== 'boolean') { show = true; };
  if(content === undefined) { content = new Panel(game, new StackLayout()); }
  if(lock === undefined) { lock = false; }
  if(visible === undefined) { visible = true; }

  if(lock && show) {
    this.selection.stop();
    this.game.input.keyboard.stop();
  } else {
    this.selection.start();
    this.game.input.keyboard.start();
  }

  this.modalComponent.empty();
  this.modalComponent.addPanel(Layout.USE_PS_SIZE, content);
  this.modalComponent.visible = show;
  this.modalComponent.bg.settings.fillAlpha = visible ? 0.8 : 0.0;
  this.modalComponent.invalidate(true);
};

GUIState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

GUIState.prototype._pause = function() {
  this.game.emit('gui/message', 'paused', 1000, 500);
};

GUIState.prototype._loggedin = function() {
  this.registrationForm.destroy();
  this.loginForm.destroy();
  this.loginForm = this.registrationForm = undefined;
  this.game.removeListener('gui/loggedin', this._loggedin);
};

GUIState.prototype._disconnected = function() {
  this.game.emit('gui/alert', GUIState.DISCONNECT_MESSAGE, false, 'connection lost');
};

GUIState.prototype._fpsProblem = function() {
  this.game.emit('gui/alert', GUIState.FPSPROBLEM_MESSAGE, 'ok', 'performance problem');
};

module.exports = GUIState;
