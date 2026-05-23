// ======================================
// utils/productAI.js
// ======================================

async function findProductsFromMessage(
  message
){

  const products = [

    {
      title:"Premium Hoodie",
      price:"$79"
    },

    {
      title:"Sneakers",
      price:"$129"
    },

    {
      title:"Luxury Watch",
      price:"$299"
    }

  ];

  return products.filter((p)=>

    message
    .toLowerCase()
    .includes(
      p.title
      .toLowerCase()
      .split(" ")[0]
    )

  );

}

module.exports = {
  findProductsFromMessage
};
