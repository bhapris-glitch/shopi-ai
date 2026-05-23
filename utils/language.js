// ======================================
// utils/language.js
// ======================================

async function detectLanguage(
  text
){

  if(/[а-яА-Я]/.test(text)){
    return "ru";
  }

  if(/[ء-ي]/.test(text)){
    return "ar";
  }

  return "en";

}

module.exports = {
  detectLanguage
};
