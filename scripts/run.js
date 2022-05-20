const testContract = async () => {
	const gameContractFactory = await hre.ethers.getContractFactory('NFTGame');
	const gameContract = await gameContractFactory.deploy(
		["Marvin", "Arthur Dent", "Zaphod Beeblebrox"],			// Names
		["https://i.imgur.com/bxYy4aX.jpeg",					// Images
		"https://i.imgur.com/sr38N1u.jpeg", 
		"https://i.imgur.com/fC1NxWl.png"],
		[600, 400, 250],										// HP values
		[130, 260, 400],										// Dark matter values
		[150, 200, 300],										// Attack damage values
		"The Vogons",											// Boss name
		"https://i.imgur.com/C8ztdR3.jpeg",						// Boss image
		4200,													// Boss hp
		42,														// Boss max dmg
	);
	await gameContract.deployed();
	console.log('Contract deployed to:', gameContract.address);


	let txn;
	txn = await gameContract.mintCharacterNFT(0);
	await txn.wait();
	console.log("Minted NFT #1");
  
	let pxn;
	pxn = await gameContract.getAllPlayers();
	console.log('All players', pxn);
	// txn = await gameContract.mintCharacterNFT(1);
	// await txn.wait();
	// console.log("Minted NFT #2");
  
	// txn = await gameContract.mintCharacterNFT(2);
	// await txn.wait();
	// console.log("Minted NFT #3");
  
	// txn = await gameContract.mintCharacterNFT(1);
	// await txn.wait();
	// console.log("Minted NFT #4");

	txn = await gameContract.attackBoss();
	await txn.wait();
	txn = await gameContract.attackBoss();
	pxn = await gameContract.getAllPlayers();
	console.log('All players', pxn);

	// let tokenUri = await gameContract.tokenURI(1);
	// console.log("Token URI:", tokenUri);


}


const runTestContract = async () => {
	try {
		await testContract();
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}

runTestContract();
