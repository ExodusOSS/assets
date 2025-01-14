// extension point so tests can assert signatures deterministically
// this has to be CJS to still be mockable once we migrate to ESM world

function getSchnorrEntropy() {}

module.exports = { getSchnorrEntropy }
