import React from 'react';
import './Highscore.css';

const Highscore = ({allPlayers}) => {
  return (
    <div className="all-players-container">
		<div className='header-board all-players-container'>
			⚔️ Metaverse Slayer Highscore Board ⚔️ 
		</div>
		<table>
			<tbody>
				<tr className='header-table'>
					<td>Rank</td>
					<td>Character Name</td>
					<td>Player</td>
					<td>Total Damage</td>
				</tr>
				{allPlayers.map((p, idx) => {
					return (
						<tr key={idx}>
							<td>
								{idx + 1}
							</td>
							<td>
								{p.characterName}
							</td>
							<td>
								{p.playerAddress}
							</td>
							<td>
								{p.totalDamage}
							</td>
						</tr>
					)
				})
				}
			</tbody>
		</table>
    </div>
  );
};

export default Highscore;
