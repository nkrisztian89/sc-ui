var engine = require('engine'),
    Layout = require('../Layout'),
    FlowLayout = require('../layouts/FlowLayout'),
    LeaderboardEntry = require('../components/LeaderboardEntry'),
    Panel = require('../Panel');

// a customizable leaderboard UI component
// includes business logic and not just pure presentation, which would be better separated,
// but for simplicity and since all the shared code is about UI, I included both here
function Leaderboard(game, settings) {
  Panel.call(this, game);

  // the settings object provides a way to customize the leaderboard, just like in the case of other UI components
  // default settings are set here in case they are not explicitly given
  if (!settings) { settings = {}; }
  if (!settings.maxEntries) { settings.maxEntries = 10; }
  if (!settings.width) { settings.width = 260; }
  if (!settings.entryHeight) { settings.entryHeight = 30; }
  if (!settings.sortMode) { settings.sortMode = Leaderboard.SORT_BY_KILLS; }
  if (!settings.maxNameLength) { settings.maxNameLength = 18; }

  this.settings = settings;

  this._sortMode = this.settings.sortMode;

  // for holding references to the players sorted according to the currently selected mode
  // (this would better be in business logic)
  this.players = [];
  // for displaying the top players on the UI using the LeaderboardEntry class
  this.entries = [];

  // the entries are added to this panel which uses the appropriate layout
  this.basePanel = new Panel(game, new FlowLayout(Layout.LEFT, Layout.TOP, Layout.VERTICAL, 6));
  this.addPanel(Layout.STRETCH, this.basePanel);
}

// static constants

// the sorting mode is accessably from outside so that it can be set
Leaderboard.SORT_BY_KILLS = 0;
Leaderboard.SORT_BY_CURRENCY = 1;

// inheritance

Leaderboard.prototype = Object.create(Panel.prototype);
Leaderboard.prototype.constructor = Leaderboard;

// static functions

Leaderboard.compareKillFn = function (playerA, playerB) {
  return playerB.kills - playerA.kills;
};

Leaderboard.compareCurrencyFn = function (playerA, playerB) {
  return playerB.currency - playerA.currency;
};

// private methods

// the same score (kills / currency) should be set to be displayed on the entries
// based on which the leaderboard is sorted
Leaderboard.prototype._getEntryDisplayMode = function () {
  switch (this.sortMode) {
    case Leaderboard.SORT_BY_KILLS:
      return LeaderboardEntry.DISPLAY_KILLS;
      break;
      case Leaderboard.SORT_BY_CURRENCY:
      return LeaderboardEntry.DISPLAY_CURRENCY;
      break;
    default:
      return LeaderboardEntry.DISPLAY_KILLS;
  }
}

// goes through the stored players and sets up the entries to display the top of them
// if the business logic was separated, this could be public, with the player list passed to it as parameter
// the other, business logic functions would belong to the model class managing the player list
Leaderboard.prototype._updateEntries = function () {
  var i, n = Math.min(this.players.length, this.settings.maxEntries);
  // first go through the entries that should be displayed
  for (i = 0; i < n; i++) {
    // setting up entries that were added before to show the correct player
    if (i < this.entries.length) {
      this.entries[i].user = this.players[i];
      this.entries[i].visible = true;
    } else {
      // adding new entries as needed
      var entry = new LeaderboardEntry(game, {
        height: this.settings.entryHeight,
        maxNameLength: this.settings.maxNameLength,
        bg: this.settings.entryBg
      }, i, this.players[i], this._getEntryDisplayMode());
      entry.setPreferredSize(this.settings.width, this.settings.entryHeight);
      this.basePanel.addPanel(Layout.LEFT, entry);
      this.entries.push(entry);
    }
  }
  // the entries not belonging to any players (becouse the player count decreased) should be hidden
  while (i < this.entries.length) {
    this.entries[i].visible = false;
    i++;
  }
  this.invalidate();
}

// sorts the players according to the current setting (business logic)
Leaderboard.prototype._sort = function () {
    var compareFn;
    switch (this.sortMode) {
      case Leaderboard.SORT_BY_KILLS:
        compareFn = Leaderboard.compareKillFn;
        break;
        case Leaderboard.SORT_BY_CURRENCY:
        compareFn = Leaderboard.compareCurrencyFn;
        break;
      default:
        compareFn = Leaderboard.compareKillFn;
    }
    this.players.sort(compareFn);
    this._updateEntries();
}

// public methods

// methods needed to layout / paint to functions

Leaderboard.prototype.calcPreferredSize = function(target) {
  return this.layout.calcPreferredSize(target);
};

Leaderboard.prototype.doLayout = function() {
  this.layout.doLayout();
};

// the public interface to manage the leaderboard

// adds a new player, keeping the list sorted (business logic)
// this should be called every time a new user joins (should be set as callback / event handler)
Leaderboard.prototype.addPlayer = function (user) {
  this.players.push(user);
  this._sort();
  this._updateEntries();
  // note that this is not optimized - since the list is already sorted, the new element could be inserted at the right place with e.g. a binary search
}

// removes a player (business logic)
// this should be called every time a user quits (should be set as callback / event handler)
Leaderboard.prototype.removePlayer = function (user) {
  var index = this.players.indexOf(user);
  if (index >= 0) {
    this.players.splice(index, 1);
    this._updateEntries();
  }
}

// setting up a property for changing the sort mode
// (to avoid internal inconsistency, changing the sort mode immediately triggers a new sort and changes the display mode of the entries to show the score that
// is the basis of the sort)
// this could be set in the game by the player (e.g. in a settins view or by pressing e.g. tab, the sorting mode could change)
// note that is no header label showing which mode is active in this implementation (should be in production)
Object.defineProperty(Leaderboard.prototype, 'sortMode', {
  set: function(value) {
    if (this._sortMode !== value) {
      this._sortMode = value;
      this._sort();
      var displayMode = this._getEntryDisplayMode();
      for (var i = 0; i < this.entries.length; i++) {
        this.entries[i].scoreDisplayMode = displayMode;
      }
      this._updateEntries();
    }
  },

  get: function() {
    return this._sortMode;
  }
});

module.exports = Leaderboard;
