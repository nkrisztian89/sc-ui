var engine = require('engine'),
    ChatHistory = require('../../datastructs/ChatHistory');

/*
 * Notes to Future Developers:
 * 1.) It would probably be best to write an intermediate class, ScrollPane, for
 * this class to extend, as well as anything else that scrolls.
 * 2.) For text which is longer than the chat box is wide, consider splitting
 * the string on ' ', and printing the maximum number of such space-deliminated
 * tokens that fit on the line - as opposed to simply printing character by
 * character, splitting words at arbitrary positions as many terminals do. For
 * either line breaking scheme, it would likely be useful to store the chat
 * box's width in characters - the most that fit per line.
 */

/**
 * Creates a new chatbox UI element, based on the provided chat history. A
 * chat box consists of a scrollable panel displaying the contents of the
 * relevant chat history, one per line.
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
  this.updateText = function(newHistory) {
    // Redraw the text; same history if undefined, else new history
    if(newHistory == undefined) {
      
    }
    else {
      
    }
  }
  
  // Draw the text for the first time
  this.updateText();
}

ChatBox.prototype = Object.create(Object.prototype); // Replace Object.prototype with appropriate subclass
ChatBox.prototype.constructor = ChatBox;
