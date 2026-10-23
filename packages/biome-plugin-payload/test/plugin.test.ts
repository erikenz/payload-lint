import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Resolve the Biome binary via Node module resolution starting from the
// package root. This works both as a standalone package (biome in local
// node_modules) and inside a monorepo (biome hoisted to the workspace root).
const require = createRequire(import.meta.url);
const biomeBin = require.resolve("@biomejs/biome/bin/biome");
const testConfig = join(import.meta.dirname, "biome.config.jsonc");
const fixturesDir = join(import.meta.dirname, "..", "..", "..", "fixtures");

interface PluginDiagnostic {
	category: string;
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

function lintFixture(relativePath: string): PluginDiagnostic[] {
	const fixture = join(fixturesDir, relativePath);

	const result = spawnSync(
		biomeBin,
		["lint", `--config-path=${testConfig}`, "--reporter=json", fixture],
		{ encoding: "utf-8" },
	);

	// The rules run at `error` severity, so `biome lint` exits non-zero when a
	// fixture violates a rule. That is expected for positive fixtures — the
	// diagnostics are parsed from the JSON report below. A crash (no report)
	// surfaces as a JSON parse error instead.
	if (result.status !== 0 && !result.stdout.includes('"diagnostics"')) {
		throw new Error(`biome failed on ${relativePath}:\n${result.stderr}`);
	}

	// Strip the "experimental reporter" notice biome prints to stdout.
	const stdout = result.stdout
		.split("\n")
		.filter(
			(line) =>
				!line.startsWith(
					"The `json` and `json-pretty` reporters are experimental",
				),
		)
		.join("\n");

	const report: { diagnostics: PluginDiagnostic[] } = JSON.parse(stdout);
	return report.diagnostics.filter(
		(diagnostic) => diagnostic.category === "plugin",
	);
}

function messagesFor(relativePath: string): string[] {
	return lintFixture(relativePath).map((diagnostic) => diagnostic.message);
}

for (const [rule, group] of Object.entries(ruleCases)) {
	describe(rule, () => {
		for (const testCase of group.cases) {
			it(testCase.name, () => {
				const messages = messagesFor(testCase.fixture);
				expect(messages).toHaveLength(testCase.diagnostics);
				for (const message of messages) {
					expect(message).toBe(group.message);
				}
			});
		}
	});
}
