import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  integer, 
  decimal,
  json,
  primaryKey,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  password: varchar('password', { length: 255 }),
  isActive: boolean('is_active').default(true),
  role: varchar('role', { length: 50 }).default('customer'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Stores table
export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  defaultCurrencyCode: varchar('default_currency_code', { length: 3 }).default('USD'),
  defaultSalesChannelId: uuid('default_sales_channel_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Store currencies
export const storeCurrencies = pgTable('store_currencies', {
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  currencyCode: varchar('currency_code', { length: 3 }),
  isDefault: boolean('is_default').default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.storeId, table.currencyCode] })
}));

// Sales channels
export const salesChannels = pgTable('sales_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDisabled: boolean('is_disabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product categories
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }).unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  parentCategoryId: uuid('parent_category_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  handleIdx: index('categories_handle_idx').on(table.handle),
}));

// Products
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }).unique(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('draft'),
  weight: integer('weight'),
  length: integer('length'),
  height: integer('height'),
  width: integer('width'),
  hsCode: varchar('hs_code', { length: 255 }),
  originCountry: varchar('origin_country', { length: 2 }),
  midCode: varchar('mid_code', { length: 255 }),
  material: varchar('material', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  handleIdx: index('products_handle_idx').on(table.handle),
  statusIdx: index('products_status_idx').on(table.status),
}));

// Product categories junction
export const productCategoryProducts = pgTable('product_category_products', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => productCategories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.categoryId] })
}));

// Product images
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product options
export const productOptions = pgTable('product_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product option values
export const productOptionValues = pgTable('product_option_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  optionId: uuid('option_id').references(() => productOptions.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product variants
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 255 }).unique(),
  barcode: varchar('barcode', { length: 255 }),
  eanCode: varchar('ean_code', { length: 255 }),
  upcCode: varchar('upc_code', { length: 255 }),
  inventoryQuantity: integer('inventory_quantity').default(0),
  allowBackorder: boolean('allow_backorder').default(false),
  manageInventory: boolean('manage_inventory').default(true),
  weight: integer('weight'),
  length: integer('length'),
  height: integer('height'),
  width: integer('width'),
  hsCode: varchar('hs_code', { length: 255 }),
  originCountry: varchar('origin_country', { length: 2 }),
  midCode: varchar('mid_code', { length: 255 }),
  material: varchar('material', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  skuIdx: index('variants_sku_idx').on(table.sku),
}));

// Product variant option values junction
export const productVariantOptionValues = pgTable('product_variant_option_values', {
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  optionValueId: uuid('option_value_id').references(() => productOptionValues.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.variantId, table.optionValueId] })
}));

// Money amounts (prices)
export const moneyAmounts = pgTable('money_amounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  currencyCode: varchar('currency_code', { length: 3 }).notNull(),
  amount: integer('amount').notNull(), // Amount in cents
  minQuantity: integer('min_quantity'),
  maxQuantity: integer('max_quantity'),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  regionId: uuid('region_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Regions
export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  currencyCode: varchar('currency_code', { length: 3 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxCode: varchar('tax_code', { length: 255 }),
  giftCardsTaxable: boolean('gift_cards_taxable').default(true),
  automaticTaxes: boolean('automatic_taxes').default(true),
  taxProviderId: varchar('tax_provider_id', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Countries
export const countries = pgTable('countries', {
  iso2: varchar('iso_2', { length: 2 }).primaryKey(),
  iso3: varchar('iso_3', { length: 3 }).unique(),
  numCode: integer('num_code'),
  name: varchar('name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  regionId: uuid('region_id').references(() => regions.id),
});

// Stock locations
export const stockLocations = pgTable('stock_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  addressId: uuid('address_id'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Addresses
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id'),
  company: varchar('company', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  address1: varchar('address_1', { length: 255 }),
  address2: varchar('address_2', { length: 255 }),
  city: varchar('city', { length: 255 }),
  countryCode: varchar('country_code', { length: 2 }),
  province: varchar('province', { length: 255 }),
  postalCode: varchar('postal_code', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory items
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 255 }),
  hsCode: varchar('hs_code', { length: 255 }),
  weight: integer('weight'),
  length: integer('length'),
  height: integer('height'),
  width: integer('width'),
  originCountry: varchar('origin_country', { length: 2 }),
  midCode: varchar('mid_code', { length: 255 }),
  material: varchar('material', { length: 255 }),
  requiresShipping: boolean('requires_shipping').default(true),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory levels
export const inventoryLevels = pgTable('inventory_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  inventoryItemId: uuid('inventory_item_id').references(() => inventoryItems.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id').references(() => stockLocations.id, { onDelete: 'cascade' }),
  stockedQuantity: integer('stocked_quantity').notNull(),
  reservedQuantity: integer('reserved_quantity').default(0),
  incomingQuantity: integer('incoming_quantity').default(0),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// API keys
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  redacted: varchar('redacted', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'secret' | 'publishable'
  lastUsedAt: timestamp('last_used_at'),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  revokedAt: timestamp('revoked_at'),
  revokedBy: varchar('revoked_by', { length: 255 }),
});

// API key sales channels junction
export const apiKeySalesChannels = pgTable('api_key_sales_channels', {
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'cascade' }),
  salesChannelId: uuid('sales_channel_id').references(() => salesChannels.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.apiKeyId, table.salesChannelId] })
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  images: many(productImages),
  options: many(productOptions),
  categories: many(productCategoryProducts),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  prices: many(moneyAmounts),
  optionValues: many(productVariantOptionValues),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(productOptionValues),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  countries: many(countries),
}));

export const stockLocationsRelations = relations(stockLocations, ({ many, one }) => ({
  inventoryLevels: many(inventoryLevels),
  address: one(addresses, {
    fields: [stockLocations.addressId],
    references: [addresses.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ many }) => ({
  levels: many(inventoryLevels),
}));

export const apiKeysRelations = relations(apiKeys, ({ many }) => ({
  salesChannels: many(apiKeySalesChannels),
}));

// Export all tables for easy access
export const schema = {
  users,
  stores,
  storeCurrencies,
  salesChannels,
  productCategories,
  products,
  productCategoryProducts,
  productImages,
  productOptions,
  productOptionValues,
  productVariants,
  productVariantOptionValues,
  moneyAmounts,
  regions,
  countries,
  stockLocations,
  addresses,
  inventoryItems,
  inventoryLevels,
  apiKeys,
  apiKeySalesChannels,
};
