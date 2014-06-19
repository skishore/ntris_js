// This file adds a few basic functions as globals or prototypes.

function assert(clause, message) {
  if (!clause) {
    throw new Error(message);
  }
}

// Returns true if this array equals the other, element-by-element.
Array.prototype.equals = function(other) {
  return !(this < other) && !(other < this);
}
