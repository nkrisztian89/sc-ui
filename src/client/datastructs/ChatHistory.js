/**
 * Creates a new chat history with an optional welcome message. A chat history
 * is effectively a fixed-capacity stack of strings, discarding old messages as
 * new ones are pushed on top.
 * 
 * @constructor
 * @param {String} [welcomeMessage] - An optional welcome message, the first
 * pushed to the chat history.
 * @param {Number} [capacity] - The maximum number of messages held in this
 * history. The pushing of further chat will entail removal of older messages.
 */
function ChatHistory(welcomeMessage, capacity) {
  var maxHistorySize = 100;
  var messages = [];
  
  if(capacity != undefined && capacity > 0)
    maxHistorySize = capacity;
  if(welcomeMessage != undefined)
    messages.push(welcomeMessage);
  
  /**
   * Returns the nth message, where the first (the most recent) is numbered 1.
   * 
   * @param {Number} msgNumber - The index, starting from 1, of the message.
   * @return The nth most recent message.
   */
  this.getMessage = function(msgNumber) {
    if(msgNumber % 1 === 0 && msgNumber >= 1 && msgNumber <= maxHistorySize)
      return messages[msgNumber + 1];
    else
      return undefined;
  };
  
  /**
   * Adds the given message to the chat history.
   * 
   * @param {String} message - The new message to add.
   * @return The old message pushed off the end, undefined if there is none.
   */
  this.pushMessage = function(message) {
    messages.push(message);
    if(messages.length > maxHistorySize)
      return messages.shift();
    else
      return undefined;
  };
  
  /**
   * Removes all save the X most recent messages.
   * 
   * @param {Number} size - The number of messages to preserve.
   */
  this.trimTo = function(size) {
    if(size % 1 === 0 && size > 0)
      messages = messages.slice(-1 * size);
    else if(size == 0)
      messages = [];
  };
  
  /**
   * Empties the chat history of all messages.
   */
  this.flush = function() {
    this.trimTo(0);
  };
  
  /**
   * Returns the current number of messages stored in this chat history.
   * 
   * @return The number of messages stored.
   */
  this.size = function() {
    return Math.min(maxHistorySize, messages.length);
  }
}

ChatHistory.prototype = Object.create(Object.prototype);
ChatHistory.prototype.constructor = ChatHistory;
