import { vi, describe, test, expect } from "vitest";

vi.mock("mongoose", async () => ({
  ...((await vi.importActual("mongoose")) as any).default,
  connect: async () => ({
    version: "1.2.3.mock",
  }),
}));

import { testEndpoint } from "express-zod-api";
import { beginAuthenticationEndpoint } from "./begin-auth.js";

describe("beginAuthenticationEndpoint", () => {
  test("should respond with oAuth URL", async () => {
    const { responseMock } = await testEndpoint({
      endpoint: beginAuthenticationEndpoint,
    });
    expect(responseMock.json).toHaveBeenCalledWith({
      data: {
        url: expect.stringContaining(
          "https://github.com/login/oauth/authorize?client_id=Iv1.a3d196a34df183d3&state=",
        ),
      },
      status: "success",
    });
  });
});
