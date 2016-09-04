var engine = require('engine'),
    Pane = require('./Pane');

/**
 * Creates a new chatbox UI element, based on the provided chat history.
 * 
 * @constructor
 * @param {ChatHistory} chatHistory - the history on which to base this chatbox.
 */
function ChatBox(chatHistory) {
  this.currentHistory = chatHistory;
  
  /**
   * Updates the text in this chatbox to reflect the current state of the chat
   * history. Optionally takes a new history, otherwise updates based on the
   * currently stored reference.
   * 
   * @param {ChatHistory} [newHistory] - A new history on which to base this
   * chatbox.
   */
  this.update = function(newHistory) {
    // Redraw the text; same history if undefined, else new history
    if(newHistory == undefined) {
      
    }
    else {
      
    }
  }
  
  this.update();
}
