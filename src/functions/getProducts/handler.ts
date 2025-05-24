import { ProductRepository } from "../../repositories/product-repository";
import { StockRepository } from "../../repositories/stock-repository";
import { ProductService } from "../../services/product-service";

const productRepository = new ProductRepository();
const stockRepository = new StockRepository();
const productService = new ProductService(productRepository, stockRepository);

export default async function () {
  console.log("getProducts");

  return productService.listProducts();
}
