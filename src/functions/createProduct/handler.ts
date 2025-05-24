import { ProductRepository } from "../../repositories/product-repository";
import { StockRepository } from "../../repositories/stock-repository";
import { ProductService } from "../../services/product-service";

const productRepository = new ProductRepository();
const stockRepository = new StockRepository();
const productService = new ProductService(productRepository, stockRepository);

export default async function (event: {
  title: string;
  description: string;
  price: string;
}) {
  console.log("createProduct", event);

  const { title, description, price } = event;

  if (!title || !description || !price) {
    throw new Error("Bad Request");
  }

  const priceNum = parseFloat(price);

  if (isNaN(priceNum) || priceNum < 0) {
    throw new Error("Bad Request");
  }

  return productService.createProduct({
    title,
    description,
    price: priceNum,
  });
}
