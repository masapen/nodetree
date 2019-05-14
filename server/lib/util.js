const isSafeUUIDForm = uuid => uuid.length == 36 && /^[0-9a-f\-]+$/g.test(uuid);

module.exports = {
	isSafeUUIDForm
};