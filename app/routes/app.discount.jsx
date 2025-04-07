import React, { useState } from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Tag,
  Button,
  Layout,
  Page,
  RadioButton,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useFetcher } from '@remix-run/react';
import prisma from "../db.server";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const customerTags = formData.get('customerTags');
  const discountValue = parseFloat(formData.get('discountValue') || '0');

  const discount = {
    title: formData.get('discountTitle'),
    description: formData.get('discountDescription'),
    status: formData.get('discountStatus'),
    customerTag: customerTags || '',
    discountType: formData.get('discountType'),
    discountValue: discountValue,
  };

  try {
    await prisma.discountRule.create({ data: discount });
    console.log('Discount saved:', discount);
    return null;
  } catch (error) {
    console.error('Error saving discount:', error);
    return null;
  }
};

export default function DiscountPricingPage() {
  const fetcher = useFetcher();

  const [discountTitle, setDiscountTitle] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [discountStatus, setDiscountStatus] = useState('active');

  const [applyToCustomers, setApplyToCustomers] = useState('all');
  const [customerTags, setCustomerTags] = useState([]);

  const [applyToProducts, setApplyToProducts] = useState('all');
  const [productIds, setProductIds] = useState([]);
  const [collectionIds, setCollectionIds] = useState([]);
  const [productTags, setProductTags] = useState([]);

  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');

  const handleRemoveCustomerTag = (index) => {
    setCustomerTags(customerTags.filter((_, i) => i !== index));
  };

  return (
    <Page fullWidth>
      <TitleBar title="Discount Pricing" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Layout>
          <Layout.Section>
            <Card title="Discount Pricing Configuration" sectioned>
              <fetcher.Form method="post">
                <FormLayout>
                  <TextField
                    label="Discount Title"
                    value={discountTitle}
                    onChange={setDiscountTitle}
                    name="discountTitle"
                  />
                  <TextField
                    label="Discount Description"
                    value={discountDescription}
                    onChange={setDiscountDescription}
                    multiline
                    name="discountDescription"
                  />
                  <Select
                    label="Discount Status"
                    options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                    ]}
                    value={discountStatus}
                    onChange={setDiscountStatus}
                    name="discountStatus"
                  />

                  {/* Customers */}
                  <p className="font-semibold mt-4">Apply to Customers:</p>
                  <RadioButton
                    label="All customers"
                    value="all"
                    checked={applyToCustomers === 'all'}
                    onChange={() => setApplyToCustomers('all')}
                  />
                  <RadioButton
                    label="Logged in customers"
                    value="loggedIn"
                    checked={applyToCustomers === 'loggedIn'}
                    onChange={() => setApplyToCustomers('loggedIn')}
                  />
                  <RadioButton
                    label="Non-logged in customers"
                    value="nonLoggedIn"
                    checked={applyToCustomers === 'nonLoggedIn'}
                    onChange={() => setApplyToCustomers('nonLoggedIn')}
                  />
                  <RadioButton
                    label="Customer tags"
                    value="customerTags"
                    checked={applyToCustomers === 'customerTags'}
                    onChange={() => setApplyToCustomers('customerTags')}
                  />
                  {applyToCustomers === 'customerTags' && (
                    <>
                      <TextField
                        label="Customer Tags"
                        value={customerTags.join(', ')}
                        onChange={(value) =>
                          setCustomerTags(
                            value.split(',').map((tag) => tag.trim()).filter(Boolean)
                          )
                        }
                        name="customerTags"
                      />
                      <div className="flex flex-wrap gap-2">
                        {customerTags.map((tag, index) => (
                          <Tag key={index} onRemove={() => handleRemoveCustomerTag(index)}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Products */}
                  <p className="font-semibold mt-4">Apply to Products:</p>
                  <RadioButton
                    label="All products"
                    value="all"
                    checked={applyToProducts === 'all'}
                    onChange={() => setApplyToProducts('all')}
                  />
                  <RadioButton
                    label="Specific products"
                    value="specificProducts"
                    checked={applyToProducts === 'specificProducts'}
                    onChange={() => setApplyToProducts('specificProducts')}
                  />
                  {applyToProducts === 'specificProducts' && (
                    <TextField
                      label="Product IDs"
                      value={productIds.join(', ')}
                      onChange={(value) =>
                        setProductIds(
                          value.split(',').map((id) => id.trim()).filter(Boolean)
                        )
                      }
                      name="productIds"
                    />
                  )}
                  <RadioButton
                    label="Specific collections"
                    value="specificCollections"
                    checked={applyToProducts === 'specificCollections'}
                    onChange={() => setApplyToProducts('specificCollections')}
                  />
                  {applyToProducts === 'specificCollections' && (
                    <TextField
                      label="Collection IDs"
                      value={collectionIds.join(', ')}
                      onChange={(value) =>
                        setCollectionIds(
                          value.split(',').map((id) => id.trim()).filter(Boolean)
                        )
                      }
                      name="collectionIds"
                    />
                  )}
                  <RadioButton
                    label="Product tags"
                    value="productTags"
                    checked={applyToProducts === 'productTags'}
                    onChange={() => setApplyToProducts('productTags')}
                  />
                  {applyToProducts === 'productTags' && (
                    <TextField
                      label="Product Tags"
                      value={productTags.join(', ')}
                      onChange={(value) =>
                        setProductTags(
                          value.split(',').map((tag) => tag.trim()).filter(Boolean)
                        )
                      }
                      name="productTags"
                    />
                  )}

                  {/* Discount Value */}
                  <Select
                    label="Discount Type"
                    options={[
                      { label: 'Percent', value: 'percent' },
                      { label: 'Amount', value: 'amount' },
                      { label: 'Fixed amount', value: 'fixed' },
                      { label: 'Discount per item', value: 'perItem' },
                    ]}
                    value={discountType}
                    onChange={setDiscountType}
                    name="discountType"
                  />
                  <TextField
                    label="Discount Value"
                    value={discountValue}
                    onChange={setDiscountValue}
                    name="discountValue"
                  />

                  <div className="mt-4">
                    <Button submit primary>
                      Save Discount
                    </Button>
                  </div>
                </FormLayout>
              </fetcher.Form>
            </Card>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}

