import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Next.js only reads `config.matcher` as a literal, so the test takes it from
 * the source. A file in public/ the matcher does not skip goes through the
 * locale proxy and answers 404 in production (JIKU-301).
 */
function proxyMatcher(): RegExp {
    const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
    const literal = /matcher:\s*\[[\s\S]*?"([^"]+)"/.exec(source);
    assert.ok(literal, "proxy.ts declares a matcher");
    const pattern = literal[1].replaceAll("\\\\", "\\");
    return new RegExp(`^${pattern}$`);
}

test("every file and folder in public/ is served without the locale proxy", () => {
    const matcher = proxyMatcher();
    const entries = readdirSync(new URL("../public/", import.meta.url), { withFileTypes: true });
    for (const entry of entries) {
        const path = entry.isDirectory() ? `/${entry.name}/sample.webp` : `/${entry.name}`;
        assert.equal(matcher.test(path), false, `${path} would go through the proxy`);
    }
});

test("pages still go through the proxy", () => {
    const matcher = proxyMatcher();
    for (const path of ["/", "/en", "/organizers", "/en/docs/check-in", "/guidelines", "/jiku-logo"]) {
        assert.equal(matcher.test(path), true, path);
    }
});
