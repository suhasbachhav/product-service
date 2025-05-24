#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";

const app = new cdk.App();
new ProductServiceStack(app, "ProductServiceStack", {});
new ImportServiceStack(app, "ImportServiceStack", {});
