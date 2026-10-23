import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import plugin from "../src/index.mjs";

// `oxlint` does not export its binary through package.json, so resolve the
// package root and join the bin path. This works in the monorepo and in a
// standalone install where oxlint is a direct dev dependency.
const require = createRequire(import.meta.url);
const oxlintBin = join(
	dirname(require.resolve("oxlint/package.json")),
	"bin",
	"oxlint",
);
const testConfig = join(import.meta.dirname, ".oxlintrc.json");
const fixturesDir = join(import.meta.dirname, "..", "..", "..", "fixtures");

interface Diagnostic {
	code: string;
	message: string;
}

interface RuleCase {
	name: string;
	fixture: string;
	diagnostics: number;
}

interface RuleGroup {
	message: string;
	cases: RuleCase[];
}

const ruleCases = JSON.parse(
	readFileSync(join(fixturesDir, "cases.json"), "utf-8"),
) as Record<string, RuleGroup>;

function diagnosticsFor(relativePath: string): Diagnostic[] {
	const result = spawnSync(
		oxlintBin,
		[
			`--config=${testConfig}`,
			"--format=json",
			join(fixturesDir, relativePath),
		],
		{ encoding: "utf-8" },
	);

	if (!result.stdout) {
		throw new Error(
			`oxlint produced no report for ${relativePath}:\n${result.stderr}`,
		);
	}

	const report: { diagnostics: Diagnostic[] } = JSON.parse(result.stdout);

	// Oxlint also runs its built-in rules; keep only this plugin's diagnostics.
	return report.diagnostics.filter((diagnostic) =>
		diagnostic.code.startsWith("payload("),
	);
}

describe("plugin entry point", () => {
	it("exports the payload plugin and all five rules", () => {
		expect(plugin.meta).toEqual({ name: "payload" });
		expect(Object.keys(plugin.rules).sort()).toEqual([
			"no-find-without-depth",
			"no-find-without-select",
			"no-missing-override-access",
			"prefer-explicit-populate",
			"require-user-with-override-false",
		]);
	});
});

for (const [rule, group] of Object.entries(ruleCases)) {
	describe(rule, () => {
		for (const testCase of group.cases) {
			it(testCase.name, () => {
				const diagnostics = diagnosticsFor(testCase.fixture);
				expect(diagnostics).toHaveLength(testCase.diagnostics);

				for (const diagnostic of diagnostics) {
					expect(diagnostic.code).toBe(`payload(${rule})`);
					expect(diagnostic.message).toBe(group.message);
				}
			});
		}
	});
}
