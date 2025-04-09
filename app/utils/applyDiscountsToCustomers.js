export async function applyDiscountsToCustomers(admin, discount) {
  const tag = discount.customerTag;

  const response = await admin.graphql(`
    {
      customers(first: 10, query: "tag:${tag}") {
        edges {
          node {
            id
          }
        }
      }
    }
  `);
  const customerResponse = await response.json();

  const customers = customerResponse.data.customers.edges.map(edge => edge.node);

  for (const customer of customers) {
    await admin.graphql(`
      mutation {
        customerUpdate(input: {
          id: "${customer.id}",
          metafields: [
            {
              namespace: "custom",
              key: "discount_type",
              type: "single_line_text_field",
              value: "${discount.discountType}"
            },
            {
              namespace: "custom",
              key: "discount_value",
              type: "number_decimal",
              value: "${discount.discountValue}"
            }
          ]
        }) {
          customer {
            id
          }
        }
      }
    `);
  }
}
