// ======================================
// utils/conversionScore.js
// ======================================

function calculateScore(data){

  let score = 0;

  // =========================
  // VISITS
  // =========================

  if(data.visits > 3){
    score += 20;
  }

  // =========================
  // CART
  // =========================

  if(data.cart){
    score += 30;
  }

  // =========================
  // CHAT
  // =========================

  if(data.chatMessages > 2){
    score += 20;
  }

  // =========================
  // RETURN USER
  // =========================

  if(data.returning){
    score += 30;
  }

  return score;

}

module.exports = {
  calculateScore
};
