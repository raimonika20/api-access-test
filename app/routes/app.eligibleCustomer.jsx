// app/routes/app.discount.jsx

import { useLoaderData } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Fetch customers from Shopify
  const customerResponse = await admin.graphql(`{
    customers(first: 20) {
      edges {
        node {
          id
          displayName
          email
          tags
        }
      }
    }
  }`);

  const customers = await customerResponse.json();

  // Get discount rule from DB (e.g., "wholesale" customers get 10% off)
  const discountRule = await prisma.discountRule.findFirst({
    where: {
      customerTag: "wholesale",
    },
  });

  const taggedCustomers = customers.data.customers.edges
    .map((edge) => edge.node)
    .filter((customer) =>
      customer.tags.includes(discountRule?.customerTag ?? "")
    );

  return {
    customers: taggedCustomers,
    discountRule,
  };
};

export default function DiscountPreviewPage() {
  const { customers, discountRule } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Eligible Customers" />
      <Layout>
        <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">Customers Eligible for Discount</h2>

          <ul className="list-disc pl-5 space-y-2">
            {customers.map((customer) => (
              <li key={customer.id} className="text-gray-800">
                <strong>{customer.displayName}</strong> ({customer.email})<br />
                <span className="text-green-600">
                  ✅ Eligible for {discountRule.discountValue}
                  {discountRule.discountType === "percent" ? "%" : "$"} off
                </span>
              </li>
            ))}
          </ul>

          {customers.length === 0 && (
            <p className="text-red-500 mt-4">No customers found with the tag "{discountRule?.customerTag}".</p>
          )}
        </div>
      </Layout>
    </Page>
  );
}
