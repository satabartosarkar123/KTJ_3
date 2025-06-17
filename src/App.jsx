import { Fragment, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Progress from './components/Progress'
import Score from './components/Score'
import Question from './components/Question'
import Leaderboard from './components/Leaderboard'
import SaveScore from './components/SaveScore'

const decodeString = string => {
	const text = document.createElement('textarea')
	text.innerHTML = string
	return text.value
}

const calculatePercentage = (fraction, total) => {
	if (fraction === 0 || total === 0) return 0
	return Math.floor((fraction * 100) / total)
}

function App() {
	const [error, setError] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [loadingQuestions, setLoadingQuestions] = useState(false)
	const [apiOptions, setApiOptions] = useState({ amount: '5' })
	const [withTimer, setWithTimer] = useState(false)
	const [timer, setTimer] = useState(0)
	const [categories, setCategories] = useState([])
	const [questionsBank, setQuestionsBank] = useState([])
	const [currentCategory, setCurrentCategory] = useState('General Knowledge')
	const [currentQuestion, setCurrentQuestion] = useState(null)
	const [questionNum, setQuestionNum] = useState(0)
	const [totalQuestions, setTotalQuestions] = useState(0)
	const [answers, setAnswers] = useState([])
	const [score, setScore] = useState(0)
	const [quizInProgress, setQuizInProgress] = useState(false)
	const [gameEnded, setGameEnded] = useState(false)

	const resetGame = () => {
		setTimer(0)
		setQuestionsBank([])
		setCurrentCategory('General Knowledge')
		setCurrentQuestion(null)
		setQuestionNum(0)
		setTotalQuestions(0)
		setAnswers([])
		setScore(0)
		setQuizInProgress(false)
		setGameEnded(false)
	}

	const handleChange = e => {
		setApiOptions(prevOptions => ({
			...prevOptions,
			[e.target.id]: e.target.value,
		}))
	}

	const handleSubmit = async e => {
		e.preventDefault()

		resetGame()

		if (apiOptions.category) {
			setCurrentCategory(
				categories.find(
					category => category.id === parseInt(apiOptions.category)
				).name
			)
		}

		setLoadingQuestions(true)
		try {
			const { data } = await axios({
				method: 'GET',
				url: 'https://opentdb.com/api.php',
				params: { ...apiOptions },
			})

			if (!data.results.length) {
				setError(
					'🙁 No questions found with the selected options. please try again!'
				)
				setLoadingQuestions(false)
				return
			}

			setQuestionsBank(
				data.results.map((questionItem, index) => {
					const answer = decodeString(questionItem.correct_answer)
					const wrongAnswers = [
						...questionItem.incorrect_answers.map(a => decodeString(a)),
						answer,
					]
					return {
						id: `${index}-${Date.now()}`,
						question: decodeString(questionItem.question),
						answer: answer,
						options: wrongAnswers.sort(() => Math.random() - 0.5),
					}
				})
			)
			setTotalQuestions(data.results.length)
			setQuizInProgress(true)
		} catch (error) {
			console.log(error)
			setError(
				'🙁 Error loading questions from the API. Please try again later.'
			)
		}
		setLoadingQuestions(false)
	}

	const handleAnswers = data => {
		setAnswers(prevData => [...prevData, data])
		setScore('?')
	}

	const setNewScoreAndQuestionNum = useRef()

	setNewScoreAndQuestionNum.current = () => {
		let newScore = 0
		
		for (const answer of answers) {
			if (answer !== null && answer.isCorrectAnswer) newScore += 100
		}

		setScore(newScore)

		if (questionNum < totalQuestions) {
			setCurrentQuestion(questionsBank[questionNum])
			setQuestionNum(questionNum + 1)
		}

		if (questionNum === totalQuestions) setGameEnded(true)
	}

	useEffect(() => {
		setLoadingCategories(true)

		let cancel

		axios({
			method: 'GET',
			url: 'https://opentdb.com/api_category.php',
			cancelToken: new axios.CancelToken(c => (cancel = c)),
		})
			.then(({ data }) => {
				const sortedByCategoryNameAsc = data.trivia_categories.sort(
					(a, b) => a.name > b.name
				)
				setCategories(sortedByCategoryNameAsc)
				setLoadingCategories(false)
			})
			.catch(error => {
				if (axios.isCancel(error)) return
				console.log(error)
				setLoadingCategories(false)
				setError(
					'🙁 Error loading categories from the API. Please try again later.'
				)
			})

		return () => cancel()
	}, [])

	useEffect(() => {
		setCurrentQuestion(questionsBank[0])
		setQuestionNum(1)
	}, [questionsBank])

	useEffect(() => {
		if (!answers.length) return
		const timeout = setTimeout(() => setNewScoreAndQuestionNum.current(), 1500)
		return () => clearTimeout(timeout)
	}, [answers])

	useEffect(() => {
		const timeout = setTimeout(() => setError(false), 5000)
		return () => clearTimeout(timeout)
	}, [error])

	return (
		<Fragment>
			<Header
				categories={categories}
				handleChange={handleChange}
				handleSubmit={handleSubmit}
				setWithTimer={setWithTimer}
				loadingCategories={loadingCategories}
				loadingQuestions={loadingQuestions}
				quizInProgress={quizInProgress}
				defaultNumOfQuestions={apiOptions.amount}
			/>

			<div className='container'>
				{error && <div className='error-message'>{error}</div>}

				{!quizInProgress && !totalQuestions && (
					<Leaderboard setError={setError} />
				)}

				{currentQuestion && (
					<Fragment>
						<div className='flex-between'>
							<Progress
								questionNum={questionNum}
								totalQuestions={totalQuestions}
								percentage={calculatePercentage(questionNum, totalQuestions)}
							/>
							<Score
								question={currentQuestion}
								score={score}
								withTimer={withTimer}
								timer={timer}
							/>
						</div>

						<Question
							question={currentQuestion}
							handleAnswers={handleAnswers}
							lastQuestion={questionNum === totalQuestions}
							gameEnded={gameEnded}
							setTimer={setTimer}
							withTimer={withTimer}
						/>
					</Fragment>
				)}

				{gameEnded && (
					<SaveScore
						category={currentCategory}
						score={score}
						setError={setError}
						resetGame={resetGame}
					/>
				)}
			</div>
		</Fragment>
	)
}

export default App
