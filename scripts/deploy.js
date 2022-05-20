const deployContract = async () => {
	const gameContractFactory = await hre.ethers.getContractFactory('NFTGame');
	const gameContract = await gameContractFactory.deploy(
		["Marvin", "Arthur Dent", "Zaphod Beeblebrox"],			// Names
		["QmYtJaAHiXLnaG23y6tn3vwCyhtgjoyjVVHZk6ZFMoqpcd",					// Images
		"QmfHtoEAWNQmDuGQrRgWihMZ5xWQ13zm39Rs3PimtEGeB2", 
		"QmeWifHLNvBJqRrBfksGayWUkCiRMGT5zmV8F5ZLk3R6dU"],
		[600, 400, 250],										// HP values
		[130, 260, 400],										// Dark matter values
		[150, 200, 300],										// Attack damage values
		"The Vogons",											// Boss name
		"QmV8mmgdCWwr4nwz2D88cXbWA4NseNvVgaXGj3HyfAREAQ",						// Boss image
		42000,													// Boss hp
		42,														// Boss max dmg
	);
	await gameContract.deployed();
	console.log('Contract deployed to:', gameContract.address);

}


const runDeployContract = async () => {
	try {
		await deployContract();
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}

runDeployContract();
