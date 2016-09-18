
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    BorderPane = require('../components/BorderPane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Leaderboard = require('../components/Leaderboard'),
	  ButtonIcon = require('../components/ButtonIcon'),
	  Tooltip = require('../components/Tooltip');

// this is actually the previous RightPane renamed
// now contains 3 buttons for testing the leaderboard
function TopPane(game, leaderboard, settings) {
  Pane.call(this, game, {
    width: 288,
    height: 96,
    padding: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    }
  });

  this.infoBorderPane = new BorderPane(game, {
    padding: [0],
    gap: [5, 0],
    bg: {
      fillAlpha: 0.0
    }
  });

  this.infoBorderPane2 = new BorderPane(game, {
    padding: [0],
    gap: [5, 0],
    bg: {
      fillAlpha: 0.0
    }
  });

  this.fpsText = new Label(game,
    '60 fps', {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    });

  this.pingText = new Label(game,
    '0 ping', {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    })

  this.versionText = new Label(game,
    'solar crusaders dev', {
      padding: [5],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    });

  // add layout panels
  this.addPanel(Layout.CENTER, this.versionText);

  // adding 3 buttons that allow testing of leaderboard functionality

  // this fist button adds a new player to the leaderboard with random scores
  this.icon1 = new ButtonIcon(game, 'texture-atlas', { icon: { frame: 'icon-x01.png' }});
  this.icon1.on('inputUp', function () {
    console.log('adding new player to leaderboard...');
    leaderboard.addPlayer({
      name: 'new test player',
      kills: Math.floor(Math.random()*20),
      currency: Math.floor(Math.random()*20)
    });
  }, this);
  this.tooltip = new Tooltip(game, 'Add player', this.icon1);
  // this second button removes the 2nd player (or the first if there is only one) from the leaderboard
  this.icon2 = new ButtonIcon(game, 'texture-atlas', { icon: { frame: 'icon-x01.png' }});
  this.icon2.on('inputUp', function () {
    console.log('removing player from leaderboard...');
    // choose the second player from the current (sorted) list, if possible
    var players = leaderboard.players;
    leaderboard.removePlayer(players[Math.min(1, players.length - 1)]);
  }, this);
  this.tooltip2 = new Tooltip(game, 'Remove player', this.icon2);
  // the third button switches between sorting by kills and sorting by currency
  this.icon3 = new ButtonIcon(game, 'texture-atlas', { icon: { frame: 'icon-x01.png' }});
  this.icon3.on('inputUp', function () {
    console.log('switching sort mode...');
    switch (leaderboard.sortMode) {
      case Leaderboard.SORT_BY_KILLS: leaderboard.sortMode = Leaderboard.SORT_BY_CURRENCY;
        break;
      case Leaderboard.SORT_BY_CURRENCY: leaderboard.sortMode = Leaderboard.SORT_BY_KILLS;
        break;
    }
  }, this);
  this.tooltip3 = new Tooltip(game, 'Switch sort mode', this.icon3);

  this.infoBorderPane2.addPanel(Layout.RIGHT, this.fpsText);
  this.infoBorderPane2.addPanel(Layout.LEFT, this.pingText);

  this.addPanel(Layout.CENTER, this.infoBorderPane2);
  this.addPanel(Layout.CENTER, this.icon1);
  this.addPanel(Layout.CENTER, this.icon2);
  this.addPanel(Layout.CENTER, this.icon3);
  // create timer
  game.clock.events.loop(500, this._updateInfo, this);
};

TopPane.prototype = Object.create(Pane.prototype);
TopPane.prototype.constructor = TopPane;

TopPane.prototype.validate = function() {
  return Pane.prototype.validate.call(this);
};

TopPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  this.invalidate(true);
};

module.exports = TopPane;
