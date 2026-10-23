import {
	ALL_PAYLOAD_OPS,
	getPayloadCallProperties,
	getPropertyValue,
	hasProperty,
} from "../shared.mjs";

export const requireUserWithOverrideFalse = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require `user` or `req` when `overrideAccess: false` on a Payload Local API call.",
		},
		messages: {
			missingUser:
				"When `overrideAccess: false` is set, pass `user`, `req`, or `user: null` so Payload knows whose permissions to check. Without them, access control functions receive `undefined` as the user. For explicit unauthenticated access, pass `user: null`.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const properties = getPayloadCallProperties(node, ALL_PAYLOAD_OPS);

				if (!properties) {
					return;
				}

				const overrideAccess = getPropertyValue(properties, "overrideAccess");

				if (
					overrideAccess?.type === "Literal" &&
					overrideAccess.value === false &&
					!hasProperty(properties, "user") &&
					!hasProperty(properties, "req")
				) {
					context.report({ node, messageId: "missingUser" });
				}
			},
		};
	},
};
