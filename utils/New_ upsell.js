/**

* ======================================
* utils/upsells.js
* Production AI Upsell Engine
* ======================================
  */

function generateUpsell(products = []) {

if (!Array.isArray(products) || products.length === 0) {
return null;
}

const first = products[0];

const title =
first.title || "this product";

const category =
(first.category || "")
.toLowerCase();

let recommendation =
"Add matching accessories for better value.";

let offer =
"Bundle & Save";

if (
category.includes("phone")
) {

```
recommendation =
  "Add a protective case and screen guard.";

offer =
  "Phone Protection Bundle";
```

}

else if (
category.includes("laptop")
) {

```
recommendation =
  "Add a laptop sleeve and wireless mouse.";

offer =
  "Productivity Bundle";
```

}

else if (
category.includes("watch")
) {

```
recommendation =
  "Add an extra strap and charging dock.";

offer =
  "Watch Essentials Bundle";
```

}

else if (
category.includes("fashion")
) {

```
recommendation =
  "Pair this with matching accessories.";

offer =
  "Style Upgrade";
```

}

return {

```
success: true,

offer,

title: "Complete Your Bundle",

message:
  `Customers who bought "${title}" often purchased complementary products.`,

recommendation,

discount:
  "Save 10% when purchased together"
```

};

}

module.exports = {
generateUpsell
};
