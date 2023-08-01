export const jsonString = `
[
  {
    "event": "begin_checkout",
    "ecommerce":{
      "value": "$value",
      "currency": "$currency",
      "order_source":"$order_source",
      "shipping_tier":"$shipping_tier",
      "items":[{
        "item_brand": "$item1.item_brand",
        "item_id": "$item1.item_id",
        "item_name": "$item1.item_name",
        "item_category": "$item1.item_category",
        "item_category2": "$item1.item_category2",
        "item_category3": "$item1.item_category3",
        "item_category4": "$item1.item_category4",
        "item_category5": "$item1.item_category5",
        "currency": "$item1.currency",
        "discount": "$item1.discount",
        "price": "$item1.value",
        "quantity": "$item1.quantity",
        "coupon": "$item1.coupon",
        "index": "$item1.index",
        "item_variant": "$item1.$item_variant"
      }]
    }
  },
  {
    "event": "add_payment_info",
    "ecommerce":{
      "value": "$value",
      "currency": "$currency",
      "order_source":"$order_source",
      "shipping_tier":"$shipping_tier",
      "items":[{
        "item_brand": "$item1.item_brand",
        "item_id": "$item1.item_id",
        "item_name": "$item1.item_name",
        "item_category": "$item1.item_category",
        "item_category2": "$item1.item_category2",
        "item_category3": "$item1.item_category3",
        "item_category4": "$item1.item_category4",
        "item_category5": "$item1.item_category5",
        "currency": "$item1.currency",
        "discount": "$item1.discount",
        "price": "$item1.value",
        "quantity": "$item1.quantity",
        "coupon": "$item1.coupon",
        "index": "$item1.index",
        "item_variant": "$item1.$item_variant"
      }]
    }
  }
]
`;
