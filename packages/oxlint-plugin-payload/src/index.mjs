import { noFindWithoutDepth } from "./rules/no-find-without-depth.mjs";
import { noFindWithoutSelect } from "./rules/no-find-without-select.mjs";
import { noMissingOverrideAccess } from "./rules/no-missing-override-access.mjs";
import { preferExplicitPopulate } from "./rules/prefer-explicit-populate.mjs";
import { requireUserWithOverrideFalse } from "./rules/require-user-with-override-false.mjs";

export default {
	meta: { name: "payload" },
	rules: {
		"no-find-without-depth": noFindWithoutDepth,
		"no-find-without-select": noFindWithoutSelect,
		"no-missing-override-access": noMissingOverrideAccess,
		"prefer-explicit-populate": preferExplicitPopulate,
		"require-user-with-override-false": requireUserWithOverrideFalse,
	},
};
