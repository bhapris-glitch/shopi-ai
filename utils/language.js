// ======================================
// utils/language.js
// Layboka AI Language Detection
// updated 2 Jun 2026
// ======================================

async function detectLanguage(text = ""){

  try{

    // Arabic
    if(/[ء-ي]/.test(text)){
      return "ar";
    }

    // Russian
    if(/[а-яА-Я]/.test(text)){
      return "ru";
    }

    // Hindi / Devanagari
    if(/[\u0900-\u097F]/.test(text)){
      return "hi";
    }

    // Chinese
    if(/[\u4E00-\u9FFF]/.test(text)){
      return "zh";
    }

    // Japanese
    if(
      /[\u3040-\u30FF]/.test(text)
    ){
      return "ja";
    }

    // Korean
    if(
      /[\uAC00-\uD7AF]/.test(text)
    ){
      return "ko";
    }

    return "en";

  }catch(err){

    return "en";

  }

}

module.exports = {
  detectLanguage
};
