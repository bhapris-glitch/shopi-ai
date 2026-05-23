// ======================================
// utils/emailSequences.js
// ======================================

function generateSequence(customer){

  return [

    {

      day:0,

      subject:
        "Welcome to Layboka",

      content:
        `Hi ${customer.name},

Thanks for joining us.`

    },

    {

      day:2,

      subject:
        "🔥 Recommended Products",

      content:
        `Products picked for you.`

    },

    {

      day:5,

      subject:
        "⏰ Your Discount Ends Soon",

      content:
        `Use your special offer today.`

    }

  ];

}

module.exports = {
  generateSequence
};
