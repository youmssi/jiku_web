import { strict as assert } from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * Next.js inlines NEXT_PUBLIC_* values when the image is built, on the server
 * as in the browser. A variable the code reads but the image build never
 * receives is empty in production whatever Dokploy sets.
 */
const root = new URL("..", import.meta.url).pathname;
const sourceFolders = ["app", "components", "lib", "i18n"];
const rootFiles = ["proxy.ts", "next.config.ts"];

function sourceFiles(folder: string): string[] {
    return readdirSync(folder).flatMap((name) => {
        const path = join(folder, name);
        if (statSync(path).isDirectory()) return sourceFiles(path);
        return /\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
    });
}

function publicVariablesInCode(): Set<string> {
    const files = [...sourceFolders.flatMap((folder) => sourceFiles(join(root, folder))), ...rootFiles.map((file) => join(root, file))];
    const names = new Set<string>();
    for (const file of files) {
        for (const match of readFileSync(file, "utf8").matchAll(/process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)/g)) {
            names.add(match[1]);
        }
    }
    return names;
}

test("every public variable the code reads is a build argument of the image", () => {
    const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
    const workflow = readFileSync(join(root, ".github/workflows/images.yml"), "utf8");
    const used = publicVariablesInCode();
    assert.ok(used.size > 0);
    for (const name of used) {
        assert.match(dockerfile, new RegExp(`^ARG ${name}$`, "m"), `${name} missing from the Dockerfile`);
        assert.match(workflow, new RegExp(`^\\s+${name}=`, "m"), `${name} missing from images.yml build-args`);
    }
});
