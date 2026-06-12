#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';

const app = new cdk.App();

// Instantiate the ProductServiceStack
new ProductServiceStack(app, 'ProductServiceStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
});

// Instantiate the ImportServiceStack
new ImportServiceStack(app, 'ImportServiceStack', {
  env: { account: '199215057860', region: 'ap-south-1' },
});