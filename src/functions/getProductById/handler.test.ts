import handler from "./handler";
import { mockProducts } from "../../mocks/products";

jest.mock("../../mocks/products", () => ({
  ...jest.requireActual("../../mocks/products"),
  getProductById: jest.fn(),
}));

import { getProductById } from "../../mocks/products";

describe("getProductById handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a product when valid id is provided", async () => {
    const mockProduct = mockProducts[0];
    (getProductById as jest.Mock).mockResolvedValue(mockProduct);
    const event = { id: "1" };

    const result = await handler(event);

    expect(getProductById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockProduct);
  });

  it("should throw NotFound error when product does not exist", async () => {
    (getProductById as jest.Mock).mockResolvedValue(undefined);
    const event = { id: "non-existent" };

    await expect(handler(event)).rejects.toThrow("NotFound");
    expect(getProductById).toHaveBeenCalledWith("non-existent");
  });
});
