import { useState } from 'react'
import { scoresRef } from '../firebase'
import { push } from 'firebase/database'

function SaveScore({ category, score, setError, resetGame }) {
	const [playerName, setPlayerName] = useState('')

	const saveScore = async e => {
		e.preventDefault()

		if (!playerName) {
			setError('Please enter your name.')
			return
		}

		try {
			push(scoresRef, {
				name: playerName,
				score: score,
				category: category,
				timestamp: new Date().toISOString(),
			})

			resetGame()
		} catch (error) {
			setError('Failed to save score.')
		}
	}

	return (
		<form className='score-form' onSubmit={saveScore}>
			{score ? (
				<>
					<h3>You got a score! 🙌</h3>
					<p>Enter your name below to save your score.</p>
					<input
						type='text'
						value={playerName}
						placeholder='Enter your name'
						onChange={e => setPlayerName(e.target.value)}
						required
					/>
					<button className='btn' type='submit'>
						Save
					</button>
					<span>or</span>
				</>
			) : (
				<h3>You didn&apos;t get a score! 😥</h3>
			)}

			<button className='btn' type='button' onClick={() => resetGame()}>
				Back to Leaderboard
			</button>
		</form>
	)
}

export default SaveScore
