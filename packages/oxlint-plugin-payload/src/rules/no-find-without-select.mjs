import {
	getPayloadCallProperties,
	hasProperty,
	PAYLOAD_FIND_OPS,
} from "../shared.mjs";

export const noFindWithoutSelect = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require an explicit `select` on Payload Local API read calls.",
		},
		messages: {
			missingSelect:
				"Payload queries should specify `select` to only fetch the fields that are needed. See https://payloadcms.com/docs/queries/select",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const properties = getPayloadCallProperties(node, PAYLOAD_FIND_OPS);

				if (properties && !hasProperty(properties, "select")) {
					context.report({ node, messageId: "missingSelect" });
				}
			},
		};
	},
};
