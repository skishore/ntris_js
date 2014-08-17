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

// Returns true if this maybe-array equals the other maybe-array, where
// a maybe-array is either an array or undefined.
maybeArraysEqual = function(first, second) {
  if (!first !== !second) {
    return false;
  }
  return arraysEqual(first, second);
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

// Partial bind polyfill for older versions of Safari from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
