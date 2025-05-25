import { Product, ProductRepository } from "../repositories/product-repository";
import { StockRepository, Stock } from "../repositories/stock-repository";

export type ProductWithStock = Product & Omit<Stock, "product_id">;

export interface CreateProductInput {
  title: string;
  description: string;
  price: string | number;
}

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository
  ) {
    this.productRepository = new ProductRepository();
    this.stockRepository = new StockRepository();
  }

  async createProduct(product: Omit<Product, "id">): Promise<ProductWithStock> {
    const createdProduct = await this.productRepository.create(product);

    const stock: Stock = {
      product_id: createdProduct.id,
      count: 0,
    };

    await this.stockRepository.create(stock);

    const productWithStock = {
      ...createdProduct,
      count: stock.count,
    };

    return productWithStock;
  }

  async createProductFromInput(
    input: CreateProductInput
  ): Promise<ProductWithStock> {
    if (!input.title || !input.description || input.price == null) {
      throw new Error(
        "Missing required fields: title, description, and price are required"
      );
    }

    if (input.title.trim() === "" || input.description.trim() === "") {
      throw new Error("Title and description cannot be empty");
    }

    const priceNum =
      typeof input.price === "string" ? parseFloat(input.price) : input.price;

    if (isNaN(priceNum) || priceNum < 0) {
      throw new Error(
        `Invalid price value: ${input.price}. Price must be a positive number`
      );
    }

    return this.createProduct({
      title: input.title.trim(),
      description: input.description.trim(),
      price: priceNum,
    });
  }

  async getProduct(id: string): Promise<ProductWithStock> {
    const product = await this.productRepository.get(id);
    const stock = await this.stockRepository.get(id);

    if (!product || !stock) {
      throw new Error("Not Found");
    }

    return { ...product, count: stock.count };
  }

  async listProducts(): Promise<ProductWithStock[]> {
    const products = await this.productRepository.list();

    const stockPromises = products.map((product) =>
      this.stockRepository.get(product.id)
    );

    const stocks = await Promise.all(stockPromises);

    return products.map((product, index) => ({
      ...product,
      count: stocks[index]?.count || 0,
    }));
  }
}
