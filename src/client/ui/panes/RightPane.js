
var engine = require('engine'),
    Layout = require('../Layout'),
    Leaderboard = require('../components/Leaderboard'),
    Pane = require('../components/Pane');

// this is a new a right pane, which houses the leaderboard
// a list of sample players is passed to it for testing
function RightPane(game, players) {
  Pane.call(this, game, {
    padding: [6],
    layout: {
      gap: 6
    },
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 1
    }
  });

  // creating the leaderboard with options demonstrating customizability
  this.leaderboard = new Leaderboard(game, {
    maxEntries: 10, // number of players displayed
    width: 260,
    entryHeight: 30,
    sortMode: Leaderboard.SORT_BY_KILLS,
    maxNameLength: 18, // usernames longer than this will be truncated (using '...') in the leaderboard
                       // has to be manually adjusted to fit the width (and expected length of kill / currency figures)
                       // could be calculated from font size (though the added complexity might not worth it)
    // background options for the displayed entries
    // the leaderboard itself has no background because of a bug: hiding the last entry (with visible = false) and invalidating the leaderboard
    // causes a wrong repaint, with the area of the last hidden entry being still painted until a new removal or addition (when the background updates
    // to this last state, the new changes again not being visible) My guess is the bug is somewhere in the painting / layouting routines but I did not track it down
    entryBg: {
      color: 0x336699,
      fillAlpha: 0.2,
      borderSize: 0.0,
      radius: 1
    }});

  // adding the sample players for testing purposes
  for (var i = 0; i < players.length; i++) {
    this.leaderboard.addPlayer(players[i]);
  }

  this.addPanel(Layout.NONE, this.leaderboard);
};

RightPane.prototype = Object.create(Pane.prototype);
RightPane.prototype.constructor = RightPane;

module.exports = RightPane;
