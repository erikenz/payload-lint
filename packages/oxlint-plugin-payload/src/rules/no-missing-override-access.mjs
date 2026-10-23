import {
	ALL_PAYLOAD_OPS,
	getPayloadCallProperties,
	hasProperty,
} from "../shared.mjs";

export const noMissingOverrideAccess = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require `overrideAccess` to be declared explicitly on every Payload Local API call.",
		},
		messages: {
			missingOverrideAccess:
				"Always declare `overrideAccess` explicitly on Payload Local API calls. The Local API bypasses access control by default (`overrideAccess: true`).",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const properties = getPayloadCallProperties(node, ALL_PAYLOAD_OPS);

				if (properties && !hasProperty(properties, "overrideAccess")) {
					context.report({ node, messageId: "missingOverrideAccess" });
				}
			},
		};
	},
};
