// This file adds the assert function to the global namespace.
function assert(clause, message) {
  if (!clause) {
    throw new Error(message);
  }
}
