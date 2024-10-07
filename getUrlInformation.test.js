import { getUrlInformation } from "./getUrlInformation.js";
import { assertEquals } from "jsr:@std/assert";

Deno.test("should return the correct information", () => {
  const url = "https://example.com/#index/4/hello?q=world";
  const definitions = ["/index/:id", "/index/:id/hello"];
  const expected = {
    path: "/index/4/hello",
    searchParams: {
      q: "world",
    },
    urlParams: {
      id: "4",
    },
    matchedDefinition: "/index/:id/hello",
  };

  assertEquals(getUrlInformation(definitions, url), expected);
});
