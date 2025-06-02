import handler from "./handler";
import { mockProducts } from "../../mocks/products";

jest.mock("../../mocks/products", () => ({
  ...jest.requireActual("../../mocks/products"),
  getProducts: jest.fn(),
}));

import { getProducts } from "../../mocks/products";

describe("getProducts handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all products", async () => {
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);

    const result = await handler();

    expect(getProducts).toHaveBeenCalled();
    expect(result).toEqual(mockProducts);
  });
});
