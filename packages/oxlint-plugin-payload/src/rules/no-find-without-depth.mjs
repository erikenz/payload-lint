import {
	getPayloadCallProperties,
	hasProperty,
	PAYLOAD_FIND_OPS,
} from "../shared.mjs";

export const noFindWithoutDepth = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require `depth` to be set explicitly on Payload Local API read calls.",
		},
		messages: {
			missingDepth:
				"Payload queries should set `depth` explicitly. Omitting it uses the application default (1), which populates one level of relationships. Use `depth: 0` to disable population. See https://payloadcms.com/docs/queries/depth",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const properties = getPayloadCallProperties(node, PAYLOAD_FIND_OPS);

				if (properties && !hasProperty(properties, "depth")) {
					context.report({ node, messageId: "missingDepth" });
				}
			},
		};
	},
};
