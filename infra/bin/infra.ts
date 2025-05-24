#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";
import { ProductStack } from "../lib/productStack";
import { StockStack } from "../lib/stockStack";

const app = new cdk.App();

const productStack = new ProductStack(app, 'ProductStack', {
    env: {
        account: process.env.AWS_ACCOUNT || '199215057860',
        region: process.env.AWS_REGION || 'ap-south-1',
    },
});

const stockStack = new StockStack(app, 'StockStack', {
    env: {
        account: process.env.AWS_ACCOUNT || '199215057860',
        region: process.env.AWS_REGION || 'ap-south-1',
    },
});

new ProductServiceStack(app, "ProductServiceStack", {
    env: {
        account: process.env.AWS_ACCOUNT || '199215057860',
        region: process.env.AWS_REGION || 'ap-south-1',
    },
    productsTable: productStack.productsTable,
    stockTable: stockStack.stockTable,
});

new ImportServiceStack(app, "ImportServiceStack", {
    env: {
        account: process.env.AWS_ACCOUNT || '199215057860',
        region: process.env.AWS_REGION || 'ap-south-1',
    },
});