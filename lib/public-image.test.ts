import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fetchPublicImage, isPrivateAddress } from "./public-image.ts";

test("internal addresses are recognised", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.20.0.4", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) {
    assert.equal(isPrivateAddress(address), true, address);
  }
  for (const address of ["8.8.8.8", "104.16.1.1", "2606:4700::1111"]) {
    assert.equal(isPrivateAddress(address), false, address);
  }
});

test("only a public https image is fetched", async () => {
  for (const link of ["http://example.com/a.png", "file:///etc/passwd", "https://127.0.0.1/a.png", "https://[::1]/a.png", "https://user:pw@example.com/a.png", "https://169.254.169.254/latest", "not a url", ""]) {
    assert.equal(await fetchPublicImage(link), null, link);
  }
});
