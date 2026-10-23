export const PAYLOAD_FIND_OPS = new Set([
	"find",
	"findByID",
	"findVersions",
	"findVersionByID",
	"findGlobal",
]);

export const PAYLOAD_MUTATION_OPS = new Set([
	"create",
	"update",
	"updateByID",
	"delete",
	"deleteByID",
	"count",
	"findDistinct",
	"updateGlobal",
	"login",
	"unlock",
]);

export const ALL_PAYLOAD_OPS = new Set([
	...PAYLOAD_FIND_OPS,
	...PAYLOAD_MUTATION_OPS,
]);

/**
 * Match `payload` and member expressions ending in `.payload` (for example
 * `req.payload` and `this.payload`). `payload.db` deliberately does not match.
 */
export function isPayloadReceiver(node) {
	if (!node) {
		return false;
	}

	if (node.type === "Identifier") {
		return node.name === "payload";
	}

	return (
		node.type === "MemberExpression" &&
		node.property.type === "Identifier" &&
		node.property.name === "payload"
	);
}

function isProperty(property) {
	return property.type === "Property" || property.type === "ObjectProperty";
}

export function hasProperty(properties, name) {
	return properties.some(
		(property) =>
			isProperty(property) &&
			((property.key.type === "Identifier" && property.key.name === name) ||
				(property.key.type === "Literal" && property.key.value === name)),
	);
}

export function getPropertyValue(properties, name) {
	const property = properties.find(
		(candidate) =>
			isProperty(candidate) &&
			((candidate.key.type === "Identifier" && candidate.key.name === name) ||
				(candidate.key.type === "Literal" && candidate.key.value === name)),
	);

	return property?.value;
}

function hasSpread(properties) {
	return properties.some(
		(property) =>
			property.type === "SpreadElement" ||
			property.type === "ExperimentalSpreadProperty",
	);
}

/**
 * Return the properties of a Local API call argument when the call can be
 * verified statically. Calls with a non-object argument or a spread are
 * skipped, matching the Biome rules' behavior.
 */
export function getPayloadCallProperties(node, operations) {
	const callee = node.callee;

	if (
		callee.type !== "MemberExpression" ||
		callee.property.type !== "Identifier" ||
		!operations.has(callee.property.name) ||
		!isPayloadReceiver(callee.object)
	) {
		return null;
	}

	const argument = node.arguments[0];

	if (argument?.type !== "ObjectExpression") {
		return null;
	}

	if (hasSpread(argument.properties)) {
		return null;
	}

	return argument.properties;
}
