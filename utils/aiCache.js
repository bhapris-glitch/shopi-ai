const cache = new Map();

function getCachedReply(message) {

  const key = message
    .toLowerCase()
    .trim();

  return cache.get(key);

}

function saveReply(message, reply) {

  const key = message
    .toLowerCase()
    .trim();

  cache.set(key, reply);

}

module.exports = {
  getCachedReply,
  saveReply
};
