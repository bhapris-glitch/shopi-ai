// ======================================
// utils/aiCache.js
// Layboka AI Cache Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

const cache = new Map();

// ======================================
// DEFAULT TTL
// ======================================

const DEFAULT_TTL =
  1000 * 60 * 60; // 1 hour

// ======================================
// NORMALIZE KEY
// ======================================

function normalizeKey(message = ""){

  return message
    .toString()
    .toLowerCase()
    .trim();

}

// ======================================
// GET CACHE
// ======================================

function getCachedReply(message){

  try{

    const key =
      normalizeKey(message);

    const item =
      cache.get(key);

    if(!item){

      return null;

    }

    // ==========================
    // EXPIRED
    // ==========================

    if(

      item.expiresAt &&
      item.expiresAt < Date.now()

    ){

      cache.delete(key);

      return null;

    }

    return item.reply;

  }catch(err){

    console.log(
      "CACHE GET ERROR:",
      err.message
    );

    return null;

  }

}

// ======================================
// SAVE CACHE
// ======================================

function saveReply(

  message,
  reply,
  ttl = DEFAULT_TTL

){

  try{

    const key =
      normalizeKey(message);

    cache.set(

      key,

      {

        reply,

        createdAt:
          Date.now(),

        expiresAt:
          Date.now() + ttl

      }

    );

    return true;

  }catch(err){

    console.log(
      "CACHE SAVE ERROR:",
      err.message
    );

    return false;

  }

}

// ======================================
// DELETE CACHE
// ======================================

function deleteReply(

  message

){

  try{

    const key =
      normalizeKey(message);

    return cache.delete(key);

  }catch(err){

    return false;

  }

}

// ======================================
// CLEAR CACHE
// ======================================

function clearCache(){

  cache.clear();

  return true;

}

// ======================================
// CACHE STATS
// ======================================

function getCacheStats(){

  return {

    entries:
      cache.size,

    memory:
      process.memoryUsage()
        .heapUsed

  };

}

// ======================================
// CLEAN EXPIRED
// ======================================

function cleanExpiredCache(){

  try{

    const now =
      Date.now();

    let removed = 0;

    for(

      const [key,value]

      of cache.entries()

    ){

      if(

        value.expiresAt &&
        value.expiresAt < now

      ){

        cache.delete(key);

        removed++;

      }

    }

    return removed;

  }catch(err){

    return 0;

  }

}

// ======================================
// AUTO CLEAN
// ======================================

setInterval(

  cleanExpiredCache,

  1000 * 60 * 30

);

// ======================================
// EXPORTS
// ======================================

module.exports = {

  getCachedReply,

  saveReply,

  deleteReply,

  clearCache,

  getCacheStats,

  cleanExpiredCache

};
