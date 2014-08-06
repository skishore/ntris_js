// This file adds a few basic functions as globals or prototypes.

function assert(clause, message) {
  if (!clause) {
    throw new Error(message);
  }
}

// Returns true if this array equals the other, element-by-element.
arraysEqual = function(first, second) {
  return !(first < second) && !(second < first);
}

function extend(child, parent) {
  for (var key in parent) {
    if (parent.hasOwnProperty(key)) {
      child[key] = parent[key];
    }
  }
  function ctor() {
    this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
}
