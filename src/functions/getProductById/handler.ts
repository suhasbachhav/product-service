import { ProductRepository } from "../../repositories/product-repository";
import { StockRepository } from "../../repositories/stock-repository";
import { ProductService } from "../../services/product-service";

const productRepository = new ProductRepository();
const stockRepository = new StockRepository();
const productService = new ProductService(productRepository, stockRepository);

export default async function (event: { id: string }) {
  console.log("getProductById", event);

  const { id } = event;
  return productService.getProduct(id);
}
