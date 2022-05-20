import React, { useEffect, useState } from 'react';
import './Arena.css';
import { ethers } from "ethers";
import config from '../../config/config';
import characterService from '../../services/characterService';
import playerService from '../../services/playerService';
import LoadingIndicator from '../LoadingIndicator';
import Highscore from '../Highscore/Highscore';

/*
* We pass in our characterNFT metadata so we can a cool card in our UI
*/
const Arena = ({ characterNFT, setCharacterNFT }) => {
	// State
	const [gameContract, setGameContract] = useState(null);
	const [boss, setBoss] = useState(null);
	const [isAttacking, setIsAttacking] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [newCriticalHit, setNewCriticalHit] = useState('');
	const [newAttackMiss, setNewAttackMiss] = useState('');
	const [allPlayers, setAllPlayers] = useState([]);
	/*
	* Toast state management
	*/
	const [showToast, setShowToast] = useState(false);

	const runAttackAction = async () => {
		setIsAttacking('attacking');
		if (gameContract) {
			try {
				console.log('attacking boss...');
				const attackTxn = await gameContract.attackBoss({gasLimit: 300000});
				await attackTxn.wait();
				console.log('attackTxn', attackTxn);
				setIsAttacking('hit');
				setShowToast(true);
				setTimeout(() => {
					setShowToast(false);
				}, 3000);
			} catch (error) {
				console.error('Error attacking boss:', error);
			}
		}
		setIsAttacking('');
	}

	// UseEffects
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

			setGameContract(gameContract);
		} else {
			console.log('Ethereum object not found');
		}
	}, []);

	useEffect(() => {

		const fetchBoss = async () => {
			try {
				const bossTxn = await gameContract.getBigBoss();
				const bossCharacter = characterService.transformCharacterData(bossTxn);
				setBoss(bossCharacter);
			} catch (error) {
				console.log(error);
			}
		}

		const fetchAllPlayers = async () => {
			try {
				const playersTxn = await gameContract.getAllPlayers();
				const players = [];
				playersTxn.forEach(p => players.push(playerService.transformPlayerData(p)));
				const sortedPlayers =  players.filter((p) => p.totalDamage).sort(function(a, b) {
                    return a.totalDamage > b.totalDamage ? -1 : 1;
                });
				console.log('sortedPlayers', sortedPlayers);
				setAllPlayers(sortedPlayers)
			} catch (error) {
				console.log(error);
			}
		}

		const onAttackComplete = async (newBossHp, newPlayerHp) => {
			const bossHp = newBossHp.toNumber();
			const playerHp = newPlayerHp.toNumber();

			console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

			setBoss((prevState) => {
				return {...prevState, hp: bossHp};
			});
			setCharacterNFT((prevState) => {
				return {...prevState, hp: playerHp};
			});
			fetchAllPlayers();
		}

		const onCriticalHit = async (criticalDamage) => {
			const criticalHit = criticalDamage.toNumber();
			setNewCriticalHit(criticalHit.toString());
			setTimeout(() => {
				setNewCriticalHit('');
			}, 3000);
		}

		const onAttackMiss = async (attackMiss) => {
			setNewAttackMiss(attackMiss);
			setTimeout(() => {
				setNewAttackMiss('');
			}, 3000);
		}

		if (gameContract) {
			fetchBoss();
			fetchAllPlayers();
			gameContract.on('AttackComplete', onAttackComplete);
			gameContract.on('CriticalHit', onCriticalHit);
			gameContract.on('AttackMiss', onAttackMiss);
		}

		return () => {
			if (gameContract) {
				gameContract.off('AttackComplete', onAttackComplete)
				gameContract.off('CriticalHit', onCriticalHit);
				gameContract.off('AttackMiss', onAttackMiss);
			}
		}
	}, [gameContract])

	return (
		<>		
			<div className="arena-container">
				{/* Character NFT */}
				{characterNFT && (
					<div className="players-container">
						<div className="player-container">
						<h2>Your Character</h2>
						<div className="player">
							<div className="image-content">
							<h2>{characterNFT.name}</h2>
							<img
								src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
								alt={`Character ${characterNFT.name}`}
							/>
							<div className="health-bar">
								<progress value={characterNFT.hp} max={characterNFT.maxHp} />
								<p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
							</div>
							</div>
							<div className="stats">
							<h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
							</div>
						</div>
						</div>
					</div>
				)}

				{boss && 
					<div className="attack-container">
						{!isAttacking && 
							<button className="cta-button" onClick={runAttackAction}>{`💥 Attack!`}</button>
						}
						{isAttacking === 'attacking' && (
							<div className="loading-indicator">
								<LoadingIndicator />
								<p>Attacking ⚔️</p>
							</div>
						)}
					</div>
				}

				{/* Boss */}
				{boss && 
					<div className="players-container">
						<div className="boss-container">
							<h2>Boss</h2>
							<div className={`boss-content ${isAttacking}`}>
								<h2>🔥 {boss.name} 🔥</h2>
								<div className="image-content">
								<img src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
								<div className="health-bar">
									<progress value={boss.hp} max={boss.maxHp} />
									<p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
								</div>
								</div>
							</div>
						</div>
					</div>
				}



				{/* Add your toast HTML right here */}
				{boss && characterNFT && (
					<div id="toast" className={showToast && !newCriticalHit ? 'show' : ''}>
						<div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
					</div>
				)}
				{/* Add your toast HTML right here */}
				{boss && characterNFT && (
					<div id="toast" className={newCriticalHit ? 'show' : ''} style={{backgroundColor: '#F492A7'}}>
						<div id="desc">{`💥 ${boss.name} got a CRITICAL hit for ${newCriticalHit}!`}</div>
					</div>
				)}
				{/* Add your toast HTML right here */}
				{boss && characterNFT && (
					<div id="toast2" className={newAttackMiss ? 'show' : ''} style={{backgroundColor: '#F3E862', color: '#181818'}}>
						<div id="desc">{`💥 ${newAttackMiss}`}</div>
					</div>
				)}
			</div>
			<Highscore allPlayers={allPlayers}/>
		</>
	);
};

export default Arena;