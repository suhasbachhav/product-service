import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ProductStack } from '../lib/products/ProductStack';
import { StockStack } from '../lib/stock/StockStack';
import { ImportServiceStack } from '../lib/import-service-stack';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();

const productStack = new ProductStack(app, 'ProductStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
});

const stockStack = new StockStack(app, 'StockStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
});

new ProductServiceStack(app, 'ProductServiceStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
  productsTable: productStack.productsTable, // Pass the products table instance
  stockTable: stockStack.stockTable,        // Pass the stock table instance
});

new ImportServiceStack(app, 'ImportServiceStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
});

