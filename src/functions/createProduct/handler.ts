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

  try {
    return await productService.createProductFromInput({
      title,
      description,
      price,
    });
  } catch (e) {
    throw new Error("Bad Request", { cause: e });
  }
}