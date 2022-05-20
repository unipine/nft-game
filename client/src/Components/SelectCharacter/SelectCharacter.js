import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from "ethers";
import config from '../../config/config';
import characterService from '../../services/characterService';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
	const [isMinting, setIsMinting] = useState(false);
	const [gameContract, setGameContract] = useState(null);
	const [defaultCharacters, setDefaultCharacters] = useState([]);

	const mintPlayerNFT = async (characterId) => {
		setIsMinting(true);
		try {
			if (gameContract) {
				console.log('Minting character in progress...');
				const mintTxn = await gameContract.mintCharacterNFT(characterId);
				await mintTxn.wait();
				console.log('mintTxn:', mintTxn);
			} else {
				window.alert("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.warn('MintCharacterAction Error:', error);
		}
		setIsMinting(false);
	}

	const renderCharacters = () => 
		defaultCharacters.map((c, idx) => (
			<div key={c.name} className='character-item img'>
				<div className='character-item .name-container'>
					<p>{c.name}</p>
				</div>
				<img src={`https://cloudflare-ipfs.com/ipfs/${c.imageURI}`} alt={c.name}/>
				<button
					className="cta-button connect-wallet-button"
					onClick={() => mintPlayerNFT(idx)}
				>Select character</button>
			</div>
		)
	);

	useEffect(() => {
		const getCharacters = async () => {
		  try {
			console.log('Getting contract characters to mint');
	  
			/*
			 * Call contract to get all mint-able characters
			 */
			const charactersTxn = await gameContract.getAllDefaultCharacters();
			console.log('charactersTxn:', charactersTxn);
	  
			/*
			 * Go through all of our characters and transform the data
			 */
			const characters = [];
			charactersTxn.forEach(c => {
				const character = characterService.transformCharacterData(c);
				characters.push(character);
			});

			/*
			 * Set all mint-able characters in state
			 */
			setDefaultCharacters(characters);
		  } catch (error) {
			console.error('Something went wrong fetching characters:', error);
		  }
		};
	  
		/*
		* Add a callback method that will fire when this event is received
		*/
		const onCharacterMint = async (sender, tokenId, characterIndex) => {
			console.log(
			`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
			);
			alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)

			/*
			* Once our character NFT is minted we can fetch the metadata from our contract
			* and set it in state to move onto the Arena
			*/
			if (gameContract) {
				const characterNFT = await gameContract.checkIfUserHasNFT();
				console.log('CharacterNFT: ', characterNFT);
				setCharacterNFT(characterService.transformCharacterData(characterNFT));
			}
		};

		if (gameContract) {
			getCharacters();

			/*
			* Setup NFT Minted Listener
			*/
			gameContract.on('CharacterNFTMinted', onCharacterMint);
		}

		return () => {
			/*
			* When your component unmounts, let;s make sure to clean up this listener
			*/
			if (gameContract) {
			gameContract.off('CharacterNFTMinted', onCharacterMint);
			}
		};
		}, [gameContract]);

	// UseEffect
	useEffect(() => {
		const { ethereum } = window;
	
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const gameContract = new ethers.Contract(
				config.contractAddress,
				config.contractABI,
				signer
			);
			/*
			* This is the big difference. Set our gameContract in state.
			*/
			setGameContract(gameContract);
			console.log('gameContract', gameContract);
		} else {
			console.log('Ethereum object not found');
		}
	}, []);

	return (
		<div className="select-character-container">
			<h2>Mint Your Hero. Choose wisely.</h2>
			{isMinting && (
				<div className="loading">
					<div className="indicator">
					<LoadingIndicator />
					<p>Minting In Progress...</p>
					</div>
					<img
					src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
					alt="Minting loading indicator"
					/>
				</div>
    		)}
			{defaultCharacters.length > 0 && (
				<div className='character-grid character-item'>{renderCharacters()}</div>
			)}
		</div>
	);
}

export default SelectCharacter;