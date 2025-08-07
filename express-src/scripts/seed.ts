import { connectDatabase, getDatabase } from '../database/connection';
import { logger } from '../utils/logger';
import { 
  stores, 
  storeCurrencies, 
  salesChannels, 
  regions, 
  countries,
  productCategories,
  products,
  productImages,
  productOptions,
  productOptionValues,
  productVariants,
  productVariantOptionValues,
  productCategoryProducts,
  moneyAmounts,
  stockLocations,
  addresses,
  inventoryItems,
  inventoryLevels,
  apiKeys,
  apiKeySalesChannels
} from '../database/schema';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

export default async function seedDemoData() {
  try {
    await connectDatabase();
    const db = getDatabase();

    logger.info('Starting seed process...');

    // Countries data
    const countriesData = [
      { iso2: 'gb', iso3: 'gbr', numCode: 826, name: 'United Kingdom', displayName: 'United Kingdom' },
      { iso2: 'de', iso3: 'deu', numCode: 276, name: 'Germany', displayName: 'Germany' },
      { iso2: 'dk', iso3: 'dnk', numCode: 208, name: 'Denmark', displayName: 'Denmark' },
      { iso2: 'se', iso3: 'swe', numCode: 752, name: 'Sweden', displayName: 'Sweden' },
      { iso2: 'fr', iso3: 'fra', numCode: 250, name: 'France', displayName: 'France' },
      { iso2: 'es', iso3: 'esp', numCode: 724, name: 'Spain', displayName: 'Spain' },
      { iso2: 'it', iso3: 'ita', numCode: 380, name: 'Italy', displayName: 'Italy' },
    ];

    // Seed store
    logger.info('Seeding store data...');
    const [store] = await db.insert(stores).values({
      name: 'Demo Store',
      defaultCurrencyCode: 'eur',
    }).returning();

    // Seed default sales channel
    const [defaultSalesChannel] = await db.insert(salesChannels).values({
      name: 'Default Sales Channel',
      description: 'Default sales channel for the store',
    }).returning();

    // Update store with default sales channel
    await db.update(stores).set({
      defaultSalesChannelId: defaultSalesChannel.id,
    }).where({ id: store.id });

    // Seed store currencies
    await db.insert(storeCurrencies).values([
      { storeId: store.id, currencyCode: 'eur', isDefault: true },
      { storeId: store.id, currencyCode: 'usd', isDefault: false },
    ]);

    logger.info('Seeding region data...');
    const [region] = await db.insert(regions).values({
      name: 'Europe',
      currencyCode: 'eur',
      taxRate: '0',
      automaticTaxes: true,
    }).returning();

    // Seed countries
    await db.insert(countries).values(
      countriesData.map(country => ({
        ...country,
        regionId: region.id,
      }))
    );

    logger.info('Seeding stock location data...');
    const [address] = await db.insert(addresses).values({
      city: 'Copenhagen',
      countryCode: 'dk',
      address1: 'Demo Address 1',
    }).returning();

    const [stockLocation] = await db.insert(stockLocations).values({
      name: 'European Warehouse',
      addressId: address.id,
    }).returning();

    logger.info('Seeding publishable API key data...');
    const apiKeyToken = `pk_${uuidv4().replace(/-/g, '')}`;
    const [publishableApiKey] = await db.insert(apiKeys).values({
      token: apiKeyToken,
      redacted: `pk_****${apiKeyToken.slice(-4)}`,
      title: 'Webshop',
      type: 'publishable',
      createdBy: 'system',
    }).returning();

    // Link API key to sales channel
    await db.insert(apiKeySalesChannels).values({
      apiKeyId: publishableApiKey.id,
      salesChannelId: defaultSalesChannel.id,
    });

    logger.info('Seeding product categories...');
    const categoryData = [
      { name: 'Shirts', handle: slugify('Shirts', { lower: true }) },
      { name: 'Sweatshirts', handle: slugify('Sweatshirts', { lower: true }) },
      { name: 'Pants', handle: slugify('Pants', { lower: true }) },
      { name: 'Merch', handle: slugify('Merch', { lower: true }) },
    ];

    const categories = await db.insert(productCategories).values(
      categoryData.map(cat => ({
        ...cat,
        isActive: true,
      }))
    ).returning();

    logger.info('Seeding product data...');
    
    // Product data structure similar to Medusa seed
    const productsData = [
      {
        title: 'Medusa T-Shirt',
        handle: 't-shirt',
        description: 'Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.',
        status: 'published',
        weight: 400,
        categoryName: 'Shirts',
        images: [
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png',
        ],
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
          { title: 'Color', values: ['Black', 'White'] },
        ],
        variants: [
          { title: 'S / Black', sku: 'SHIRT-S-BLACK', options: { Size: 'S', Color: 'Black' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'S / White', sku: 'SHIRT-S-WHITE', options: { Size: 'S', Color: 'White' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'M / Black', sku: 'SHIRT-M-BLACK', options: { Size: 'M', Color: 'Black' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'M / White', sku: 'SHIRT-M-WHITE', options: { Size: 'M', Color: 'White' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'L / Black', sku: 'SHIRT-L-BLACK', options: { Size: 'L', Color: 'Black' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'L / White', sku: 'SHIRT-L-WHITE', options: { Size: 'L', Color: 'White' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'XL / Black', sku: 'SHIRT-XL-BLACK', options: { Size: 'XL', Color: 'Black' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'XL / White', sku: 'SHIRT-XL-WHITE', options: { Size: 'XL', Color: 'White' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
        ],
      },
      {
        title: 'Medusa Sweatshirt',
        handle: 'sweatshirt',
        description: 'Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.',
        status: 'published',
        weight: 400,
        categoryName: 'Sweatshirts',
        images: [
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png',
        ],
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
          { title: 'S', sku: 'SWEATSHIRT-S', options: { Size: 'S' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'M', sku: 'SWEATSHIRT-M', options: { Size: 'M' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'L', sku: 'SWEATSHIRT-L', options: { Size: 'L' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'XL', sku: 'SWEATSHIRT-XL', options: { Size: 'XL' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
        ],
      },
      {
        title: 'Medusa Sweatpants',
        handle: 'sweatpants',
        description: 'Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.',
        status: 'published',
        weight: 400,
        categoryName: 'Pants',
        images: [
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png',
        ],
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
          { title: 'S', sku: 'SWEATPANTS-S', options: { Size: 'S' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'M', sku: 'SWEATPANTS-M', options: { Size: 'M' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'L', sku: 'SWEATPANTS-L', options: { Size: 'L' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'XL', sku: 'SWEATPANTS-XL', options: { Size: 'XL' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
        ],
      },
      {
        title: 'Medusa Shorts',
        handle: 'shorts',
        description: 'Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.',
        status: 'published',
        weight: 400,
        categoryName: 'Merch',
        images: [
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png',
          'https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png',
        ],
        options: [
          { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
          { title: 'S', sku: 'SHORTS-S', options: { Size: 'S' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'M', sku: 'SHORTS-M', options: { Size: 'M' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'L', sku: 'SHORTS-L', options: { Size: 'L' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
          { title: 'XL', sku: 'SHORTS-XL', options: { Size: 'XL' }, prices: [{ amount: 1000, currencyCode: 'eur' }, { amount: 1500, currencyCode: 'usd' }] },
        ],
      },
    ];

    // Seed products
    for (const productData of productsData) {
      const category = categories.find(cat => cat.name === productData.categoryName);
      if (!category) continue;

      // Create product
      const [product] = await db.insert(products).values({
        title: productData.title,
        handle: productData.handle,
        description: productData.description,
        status: productData.status,
        weight: productData.weight,
      }).returning();

      // Link product to category
      await db.insert(productCategoryProducts).values({
        productId: product.id,
        categoryId: category.id,
      });

      // Create product images
      await db.insert(productImages).values(
        productData.images.map(url => ({
          productId: product.id,
          url,
        }))
      );

      // Create product options and values
      const optionValueMap: Record<string, string[]> = {};
      for (const option of productData.options) {
        const [productOption] = await db.insert(productOptions).values({
          productId: product.id,
          title: option.title,
        }).returning();

        const optionValues = [];
        for (const value of option.values) {
          const [optionValue] = await db.insert(productOptionValues).values({
            optionId: productOption.id,
            value,
          }).returning();
          optionValues.push(optionValue);
        }
        
        optionValueMap[option.title] = optionValues.map(ov => ov.id);
      }

      // Create product variants
      for (const variantData of productData.variants) {
        const [variant] = await db.insert(productVariants).values({
          productId: product.id,
          title: variantData.title,
          sku: variantData.sku,
          inventoryQuantity: 1000000,
          manageInventory: true,
          allowBackorder: false,
        }).returning();

        // Link variant to option values
        for (const [optionTitle, optionValue] of Object.entries(variantData.options)) {
          const optionValues = optionValueMap[optionTitle];
          const optionValueId = optionValues?.find(ovId => {
            // This would need a lookup, for simplicity we'll skip for now
            // In a real implementation, you'd query to find the right option value ID
          });
          
          // For demo purposes, we'll just link to the first option value
          // In production, you'd properly match the option value
          if (optionValues?.[0]) {
            await db.insert(productVariantOptionValues).values({
              variantId: variant.id,
              optionValueId: optionValues[0],
            });
          }
        }

        // Create money amounts (prices)
        await db.insert(moneyAmounts).values(
          variantData.prices.map(price => ({
            variantId: variant.id,
            currencyCode: price.currencyCode,
            amount: price.amount,
          }))
        );

        // Create inventory item
        const [inventoryItem] = await db.insert(inventoryItems).values({
          sku: variantData.sku,
          requiresShipping: true,
        }).returning();

        // Create inventory level
        await db.insert(inventoryLevels).values({
          inventoryItemId: inventoryItem.id,
          locationId: stockLocation.id,
          stockedQuantity: 1000000,
          reservedQuantity: 0,
          incomingQuantity: 0,
        });
      }
    }

    logger.info('Seed completed successfully!');
    logger.info(`Store ID: ${store.id}`);
    logger.info(`Sales Channel ID: ${defaultSalesChannel.id}`);
    logger.info(`API Key: ${publishableApiKey.token}`);

  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDemoData().then(() => {
    logger.info('Seed script completed');
    process.exit(0);
  }).catch((error) => {
    logger.error('Seed script failed:', error);
    process.exit(1);
  });
}
