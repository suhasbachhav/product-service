import { Product, ProductRepository } from "../repositories/product-repository";
import { StockRepository, Stock } from "../repositories/stock-repository";

export type ProductWithStock = Product & Omit<Stock, "product_id">;

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
