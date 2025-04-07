import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  // Get an authenticated Shopify Admin API client (GraphQL) for this request.
  // This lets us securely make API calls as the logged-in store.
  const { admin } = await authenticate.admin(request);


  const productResponse = await admin.graphql(`{
    # products: a list of products.
    products(first: 5) {
      # edges: A list of "wrappers" around each product, that includes all the metadata about each product.
      edges {
        # node: The actual product object, this is where the actual data like id, title lives.
        node {
          id
          title
          status
        }
      }
    }
  }`);

  const customerResponse = await admin.graphql(`{
    customers(first: 5) {
      edges {
        node {
          id
          displayName
          email
        }
      }
    }
  }`);

  const products = await productResponse.json();
  const customers = await customerResponse.json();

  return {
    customers: customers.data.customers.edges.map(edge => edge.node),
    products: products.data.products.edges.map(edge => edge.node),
  };
};

export default function DisplayDataPage() {
  const { customers, products } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Display data page" />
      <Layout>
        <div className="p-4 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-500 mb-4">Current Data</h2>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-2">Customers</h3>
            <ul className="list-disc pl-5">
              {customers.map((customer) => (
                <li key={customer.id}>
                  {customer.displayName} ({customer.email})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Products</h3>
            <ul className="list-disc pl-5">
              {products.map((product) => (
                <li key={product.id}>
                  {product.title} - {product.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    </Page>
  );
}
