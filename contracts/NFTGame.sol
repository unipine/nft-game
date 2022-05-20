//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

// We first import some OpenZeppelin Contracts.
// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
// Helper we wrote to encode in Base64
import "./libraries/Base64.sol";

contract NFTGame is ERC721{
	/*
		Will be used to determine a critical hit
	*/
	uint256 private criticalHitChance;
	uint256 private criticalHitMultiplicator;
	uint256 private attackMissChance;
	uint256 private attackMissMultiplicator;
	/*
		Here we create a struct, that holds the attributed of each character.
	*/
	struct CharacterAttributes {
		uint characterIndex;
		string name;
		string imageURI;
		uint hp;
		uint maxHp;
		uint darkMatter;
		uint maxDarkMatter;
		uint attackDamage;
	}

	struct BigBoss {
		string name;
		string imageURI;
		uint hp;
		uint maxHp;
		uint attackDamage;
	}

	struct Player {
		uint256 nftTokenId;
		uint	totalDamage;
		address playerAddress;
		string	characterName;
		string	characterImage;
	}

	BigBoss public bigBoss;

	// The tokenId is the NFTs unique identifier, it's just a number that goes
  	// 0, 1, 2, 3, etc.
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	/*
		An array that holds the default data of our characters.
		This will be helpful when we mint new characters, and need to know
		the specific attributes like darkMatter, hp, ...
	*/
	CharacterAttributes[] defaultCharacters;

	// Here we create a mapping/hash table from the nft's tokenId -> that NFTs attributes
	mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

	// A mapping/hash table from an address => the NFTs tokenId. Gives me an ez way
	// to store the owner of the NFT and reference it later.
	mapping(address => uint) public nftHolders;
	
	/*
		Here we define event listener for NFTs minted, and when an attack has been completed
	*/
	event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
	event AttackComplete(uint newBossHp, uint newPlayerHp);
	event CriticalHit(uint criticalDamage);
	event AttackMiss(string attackMiss);

	/*
		An array that will hold and return all players. Updated every time the function
		getAllPlayers() is being called
	*/
	Player[] allPlayers;

	/*
  		Data passed in to the contract when it's first created initializing the characters.
  		We're going to actually pass these values in from run.js.
	*/
    constructor(
		string[] memory characterNames,
		string[] memory characterImageURIs,
		uint[] memory characterHp,
		uint[] memory characterDarkMatter,
		uint[] memory characterAttackingDmg,
		string memory bossName, // These new variables would be passed in via run.js or deploy.js.
		string memory bossImageURI,
		uint bossHp,
		uint bossAttackDamage
	) ERC721("42-Metaverse-Heroes", "42HEROES") {
        for(uint i = 0; i < characterNames.length; i++) {
			defaultCharacters.push(CharacterAttributes({
				characterIndex: i,
				name: characterNames[i],
				imageURI: characterImageURIs[i],
				hp: characterHp[i],
				maxHp: characterHp[i],
				darkMatter: characterDarkMatter[i],
				maxDarkMatter: characterDarkMatter[i],
				attackDamage: characterAttackingDmg[i]
			}));
			
			CharacterAttributes memory c = defaultCharacters[i];
			console.log("Done initializing %s img %s", c.name, c.imageURI);
			console.log("w/ HP %s and DM %s", c.hp, c.darkMatter);
		}
		bigBoss = BigBoss({
			name: bossName,
			imageURI: bossImageURI,
			hp: bossHp,
			maxHp: bossHp,
			attackDamage: bossAttackDamage
		});
		console.log("Done initializing boss %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);
		// here we increment the tokenId so that the first NFT character starts with 1, instead of 0
		_tokenIds.increment();
		criticalHitMultiplicator = 1;
		attackMissMultiplicator = 1;
    }

	// here we return the NFT to a user, if one exists
	function checkIfUserHasNFT() public view returns (CharacterAttributes memory) {
		uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
		if (nftTokenIdOfPlayer > 0) {
			return nftHolderAttributes[nftTokenIdOfPlayer];
		} else {
			CharacterAttributes memory emptyStruct;
			return emptyStruct;
		}
	}

	function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
		return defaultCharacters;
	}

	function getBigBoss() public view returns (BigBoss memory) {
		return bigBoss;
	}

	function getAllPlayers() public view returns (Player[] memory) {
		return allPlayers;
	}

	function attackBoss() public {
		uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
		/*
			I use the keyword storage here as well which will be more important a bit later. 
			Basically, when we do storage and then do player.hp = 0 then it would change the 
			health value on the NFT itself to 0. In contrast, if we were to use memory instead of 
			storage it would create a local copy of the variable within the scope of the function. 
			That means if we did player.hp = 0 it would only be that way within the function and 
			wouldn't change the global value.

			storage = global change
			memory = local copy change
		*/
		CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
		console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
		console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);

		/*
			Here we make sure the plater has > 0 hp == is alive
		*/
		require(player.hp > 0, "Error: character must have HP in order to attack");
				/*
			Here we make sure the plater has > 0 hp == is alive
		*/
		require(bigBoss.hp > 0, "Error: boss must have HP in order to attack");

		criticalHitChance = (block.difficulty + block.timestamp + criticalHitChance) % 100;
		attackMissChance = (block.difficulty + block.timestamp + criticalHitChance + attackMissChance) % 100;
		if (criticalHitChance <= 10) {
			criticalHitMultiplicator = 2;
			emit CriticalHit(player.attackDamage * criticalHitMultiplicator);
		}
		if (attackMissChance <= 20) {
			attackMissMultiplicator = 0;
			emit AttackMiss(string(abi.encodePacked(bigBoss.name, " missed the attack!")));
		}
		// Allow player to attack boss.
		if (bigBoss.hp < player.attackDamage) {
			bigBoss.hp = 0;
		} else {
			bigBoss.hp = bigBoss.hp - (player.attackDamage * criticalHitMultiplicator);
			for (uint i; i < allPlayers.length; i++) {
				if (allPlayers[i].playerAddress == msg.sender) {
					allPlayers[i].totalDamage += (player.attackDamage * criticalHitMultiplicator);
				}
			}
		}
		// Allow boss to attack player.
		if (player.hp < bigBoss.attackDamage) {
			player.hp = 0;
		} else {
			player.hp = player.hp - (bigBoss.attackDamage * attackMissMultiplicator);
		}
		// Console for ease.
		console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
		console.log("Boss attacked player. New player hp: %s\n", player.hp);
		emit AttackComplete(bigBoss.hp, player.hp);
	}

	/*
		External vs public:

		Public function require more gas than external. The difference is because in public functions, Solidity immediately 
		copies array arguments to memory, while external functions can read directly from calldata. Memory allocation 
		is expensive, whereas reading from calldata is cheap.

		For external functions, the compiler doesn't need to allow internal calls, and so it allows arguments to be 
		read directly from calldata, saving the copying step.

		As for best practices, you should use external if you expect that the function will only ever be called externally, 
		and use public if you need to call the function internally.
	*/
	function mintCharacterNFT(uint _characterIndex) external {
		// Get current tokenId (starts at 1 since we incremented in the constructor).
		uint256 newItemId = _tokenIds.current();

     	// Actually mint the NFT to the sender using msg.sender.
		_safeMint(msg.sender, newItemId);
		
		// We map the tokenId => their character attributes. More on this in
		// the lesson below.
		nftHolderAttributes[newItemId] = CharacterAttributes({
				characterIndex: _characterIndex,
				name: defaultCharacters[_characterIndex].name,
				imageURI: defaultCharacters[_characterIndex].imageURI,
				hp: defaultCharacters[_characterIndex].hp,
				maxHp: defaultCharacters[_characterIndex].maxHp,
				darkMatter: defaultCharacters[_characterIndex].darkMatter,
				maxDarkMatter: defaultCharacters[_characterIndex].maxDarkMatter,
				attackDamage: defaultCharacters[_characterIndex].attackDamage
		});
		console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);

		// keep an easy way to see who owns that NFT
		nftHolders[msg.sender] = newItemId;
		allPlayers.push(Player({
			nftTokenId: newItemId,
			totalDamage: 0,
			playerAddress: msg.sender,
			characterName: defaultCharacters[_characterIndex].name,
			characterImage: defaultCharacters[_characterIndex].imageURI
		}));
		emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
		_tokenIds.increment();
	}


	function tokenURI(uint _tokenId) public view override returns (string memory) {
		CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

		string memory strHp = Strings.toString(charAttributes.hp);
		string memory strMaxHp = Strings.toString(charAttributes.maxHp);
		string memory strDm = Strings.toString(charAttributes.darkMatter);
		string memory strMaxDm = Strings.toString(charAttributes.maxDarkMatter);
		string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

		string memory json = Base64.encode(
			bytes(
				string(
					abi.encodePacked(
						'{"name": "',
						charAttributes.name,
						' -- NFT #: ',
						Strings.toString(_tokenId),
						'", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "https://cloudflare-ipfs.com/ipfs/',
						charAttributes.imageURI,
						'", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
						strAttackDamage,'}, { "trait_type": "Dark Matter Points", "value": ',strDm,', "max_value":',strMaxDm,'}]}'
					)
				)
			)
		);

		string memory output = string(
			abi.encodePacked("data:application/json;base64,", json)
		);

		console.log("\n--------------------");
		console.log(
				string(
					abi.encodePacked(
						"https://nftpreview.0xdev.codes/?code=",
						output
					)
				)
		);
		console.log("--------------------\n");

		return output;
	}
}
