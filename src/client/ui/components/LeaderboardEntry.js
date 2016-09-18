var engine = require('engine'),
    Layout = require('../Layout'),
    BackgroundView = require('../views/BackgroundView'),
    FlowLayout = require('../layouts/FlowLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Panel = require('../Panel');

// private constants

var DEFAULT_NAME = 'unnamed', // used for players that have no name (should not happen)
    DEFAULT_IMAGE_KEY = 'user-placeholder', // used for players that have no image set (could happen)
    // there are several labels within this components, they all use the same static settings (in production, these could be customizable)
    LABEL_SETTINGS = {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    };

// a class that can display a leaderboard rank index, an image, user name and a score for the user
function LeaderboardEntry(game, settings, index, user, scoreDisplayMode) {
  Panel.call(this, game, new BorderLayout(0, 0));
  // default values for arguments
  if (index === undefined) { index = 0; }
  if (scoreDisplayMode === undefined) { scoreDisplayMode = LeaderboardEntry.DISPLAY_KILLS };

  // organize the content using panels and layouts - the score should be on the right, aligned to the right, while other conent flows from left
  this.leftPanel = new Panel(game, new FlowLayout(Layout.LEFT, Layout.CENTER, Layout.HORIZONTAL, 6));
  this.rightPanel = new Panel(game, new FlowLayout(Layout.RIGHT, Layout.CENTER, Layout.HORIZONTAL, 6));
  // the image is changed when a new user is set to be displayed, so a container is used to easily remove the old and add the new image at the same
  // place within the layout (possibly the key of the same image component could be changed or another better performing method could be used in
  // production)
  this.imageContainer = new Panel(game);

  this.indexLabel = new Label(game, this._getIndexString(index), LABEL_SETTINGS);
  this.usernameLabel = new Label(game, 'username', LABEL_SETTINGS);
  this.scoreLabel = new Label(game, 'score', LABEL_SETTINGS);

  // this detemines which score to display
  this._scoreDisplayMode = scoreDisplayMode;

  this.settings = settings;

  // has a customizable background
  this.bg = new BackgroundView(game, this.settings.bg);
  this.addView(this.bg);

  // this will invoke the setter and set the texts / image to the data taken from the user
  this.user = user;

  // setting up the layout
  this.leftPanel.addPanel(Layout.LEFT, this.indexLabel);
  this.leftPanel.addPanel(Layout.LEFT, this.imageContainer);
  this.leftPanel.addPanel(Layout.LEFT, this.usernameLabel);
  this.addPanel(Layout.LEFT, this.leftPanel);
  this.rightPanel.addPanel(Layout.RIGHT, this.scoreLabel);
  this.addPanel(Layout.RIGHT, this.rightPanel);
}

// public constants

// use these constants to set which score should be displayed on a leaderboard entry
LeaderboardEntry.DISPLAY_KILLS = 0;
LeaderboardEntry.DISPLAY_CURRENCY = 1;

// inheritance

LeaderboardEntry.prototype = Object.create(Panel.prototype);
LeaderboardEntry.prototype.constructor = LeaderboardEntry;

// private methods

// calculates and returns the string to be used for the label showing the rank of the player
LeaderboardEntry.prototype._getIndexString = function (index) {
    var result = (index + 1).toString(); // index 0 is the first rank
    // leaderboards can show one or two digit ranks, by padding one digit ranks, auto-layouting can be used and all rank labels will have the same size
    // using '#' would be better, but it is not part of the game font
    return ((result.length < 2) ? ' ' : '') + '-' + result + '-';
};

// long usernames are truncated based on the settings
LeaderboardEntry.prototype._updateNameText = function () {
  var username = this._user.name || DEFAULT_NAME;
  if (username.length > this.settings.maxNameLength) {
    username = username.substr(0, this.settings.maxNameLength - 3) + '...';
  }
  this.usernameLabel.text = username;
  // setting a new text does not automatically invalidate
  this.usernameLabel.invalidate();
};

// chooses the appropriate property based on the display mode setting
LeaderboardEntry.prototype._updateScoreText = function () {
  var score = 0;
  switch(this.scoreDisplayMode) {
    case LeaderboardEntry.DISPLAY_KILLS:
      score = this._user.kills;
      break;
    case LeaderboardEntry.DISPLAY_CURRENCY:
      score = this._user.currency;
      break;
  }
  this.scoreLabel.text = (score || 0).toString();
  this.scoreLabel.invalidate();
};

// public methods

// methods needed to layout / paint to functions

LeaderboardEntry.prototype.calcPreferredSize = function(target) {
  return this.layout.calcPreferredSize(target);
};

LeaderboardEntry.prototype.doLayout = function() {
  this.layout.doLayout();
};

// the public interface to manage the leaderboard entry

// setting a new user to be displayed automatically takes the user's properties and updates
// the appropriate labels / image
// this has a quite fat setter, it can be desirable to avoid this and use a method for this in production,
Object.defineProperty(LeaderboardEntry.prototype, 'user', {
  set: function(value) {
    if (this._user !== value) {
      this._user = value;
      if (typeof value !== 'object') { value = {}; }
      this._updateNameText();
      this._updateScoreText();
      // changing the image could probably be done better
      var imageKey = value.imageKey || DEFAULT_IMAGE_KEY;
      if (!this.userImage || (imageKey !== this.userImage.image.key)) {
        if (this.userImage) {
          this.imageContainer.removePanel(this.userImage);
        }
        this.userImage = new Image(game, imageKey, {
            width: this.settings.height,
            height: this.settings.height,
            padding: [0],
            border: [0],
            bg: {
              fillAlpha: 0.0
            }
          });
        this.imageContainer.addPanel(Layout.STRETCH, this.userImage);
      }
      this.invalidate();
    }
  },

  get: function() {
    return this._user;
  }
});

// changing the display mode will automatically update the shown score
Object.defineProperty(LeaderboardEntry.prototype, 'scoreDisplayMode', {
  set: function(value) {
    if (this._scoreDisplayMode !== value) {
      this._scoreDisplayMode = value;
      this._updateScoreText();
    }
  },

  get: function() {
    return this._scoreDisplayMode;
  }
});

module.exports = LeaderboardEntry;
