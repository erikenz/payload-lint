import {
	getPayloadCallProperties,
	getPropertyValue,
	hasProperty,
	PAYLOAD_FIND_OPS,
} from "../shared.mjs";

export const preferExplicitPopulate = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require `populate` when a Payload read call uses a positive `depth`.",
		},
		messages: {
			missingPopulate:
				"Payload queries with `depth` greater than 0 should specify `populate` to control which fields of populated related documents are returned. See https://payloadcms.com/docs/queries/select#populate",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const properties = getPayloadCallProperties(node, PAYLOAD_FIND_OPS);

				if (!properties) {
					return;
				}

				const depth = getPropertyValue(properties, "depth");

				if (
					depth?.type === "Literal" &&
					typeof depth.value === "number" &&
					depth.value > 0 &&
					!hasProperty(properties, "populate")
				) {
					context.report({ node, messageId: "missingPopulate" });
				}
			},
		};
	},
};
