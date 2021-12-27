import { testEndpoint } from "express-zod-api";
import { beginAuthenticationEndpoint } from "./begin-auth";

describe("beginAuthenticationEndpoint", () => {
  test("should respond with oAuth URL", async () => {
    const { responseMock } = await testEndpoint({
      endpoint: beginAuthenticationEndpoint,
    });
    expect(responseMock.json).toHaveBeenCalledWith({
      data: {
        url: expect.stringContaining(
          "https://github.com/login/oauth/authorize?client_id=Iv1.a3d196a34df183d3&state="
        ),
      },
      status: "success",
    });
  });
});
