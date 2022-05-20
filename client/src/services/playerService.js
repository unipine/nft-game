const transformPlayerData = (playerTxn) => {
	const transformedCharacter = {
		nftTokenId: playerTxn.nftTokenId.toNumber(),
		totalDamage: playerTxn.totalDamage.toNumber(),
		playerAddress: playerTxn.playerAddress,
		characterName: playerTxn.characterName,
		characterImage: playerTxn.characterImage,
	}
	return transformedCharacter;
}

export default {
	transformPlayerData,
}