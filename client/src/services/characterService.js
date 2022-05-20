const transformCharacterData = (characterTxn) => {
	const transformedCharacter = {
		index: (characterTxn.characterIndex ? characterTxn.characterIndex.toNumber() : 0),
		name: characterTxn.name,
		imageURI: characterTxn.imageURI,
		hp: characterTxn.hp.toNumber(),
		maxHp: characterTxn.maxHp.toNumber(),
		darkMatter: (characterTxn.darkMatter ? characterTxn.darkMatter.toNumber() : 300),
		maxDarkMatter: (characterTxn.maxDarkMatter ? characterTxn.maxDarkMatter.toNumber() : 300),
		attackDamage: characterTxn.attackDamage.toNumber(),
	}
	return transformedCharacter;
}

export default {
	transformCharacterData,
}