import axios from 'axios'
import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import TeatroLists from './TeatroLists.jsx'
import DateSelector from './DateSelector'
import Loading from './Loading'
import SalaShort from './SalaShort.jsx'

const SalaListsByObra = ({ obras, selectedObraIndex, setSelectedObraIndex, auth }) => {
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [salas, setSalas] = useState([])
	const [isFetchingSalasDone, setIsFetchingSalasDone] = useState(false)
	const [selectedTeatroIndex, setSelectedTeatroIndex] = useState(
		parseInt(sessionStorage.getItem('selectedTeatroIndex'))
	)
	const [teatros, setTeatros] = useState([])
	const [isFetchingTeatros, setIsFetchingTeatros] = useState(true)

	const fetchTeatros = async (data) => {
		try {
			setIsFetchingTeatros(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/teatro/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/teatro')
			}
			// console.log(response.data.data)
			setTeatros(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingTeatros(false)
		}
	}

	useEffect(() => {
		fetchTeatros()
	}, [])

	const fetchSalas = async (data) => {
		try {
			setIsFetchingSalasDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get(
					`/sala/obra/unreleased/${
						obras[selectedObraIndex]._id
					}/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`,
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
			} else {
				response = await axios.get(
					`/sala/obra/${
						obras[selectedObraIndex]._id
					}/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`
				)
			}
			setSalas(
				response.data.data.sort((a, b) => {
					if (a.teatro.name > b.teatro.name) return 1
					if (a.teatro.name === b.teatro.name && a.number > b.number) return 1
					return -1
				})
			)
			setIsFetchingSalasDone(true)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchSalas()
	}, [selectedObraIndex, selectedDate])

	const props = {
		teatros,
		selectedTeatroIndex,
		setSelectedTeatroIndex,
		fetchTeatros,
		auth,
		isFetchingTeatros
	}

	const filteredSalas = salas.filter((sala) => {
		if (selectedTeatroIndex === 0 || !!selectedTeatroIndex) {
			return sala.teatro?.name === teatros[selectedTeatroIndex]?.name
		}
		return true
	})

	return (
		<>
			<TeatroLists {...props} />
			<div className="mx-4 h-fit rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 text-gray-900 drop-shadow-md sm:mx-8">
				<div className="flex flex-col gap-6 p-4 sm:p-6">
					<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
					<div className="flex flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white py-4">
						<div className="flex items-center">
							<img src={obras[selectedObraIndex].img} className="w-32 px-4 drop-shadow-md" />
							<div>
								<h4 className="text-2xl font-semibold">{obras[selectedObraIndex].name}</h4>
								<p className="text-md font-medium">
								duración : {obras[selectedObraIndex].length || '-'} min
								</p>
							</div>
						</div>
					</div>
					{isFetchingSalasDone ? (
						<div className="flex flex-col">
							{filteredSalas.map((sala, index) => {
								return (
									<div
										key={index}
										className={`flex flex-col ${
											index !== 0 &&
											filteredSalas[index - 1]?.teatro.name !==
												filteredSalas[index].teatro.name &&
											'mt-6'
										}`}
									>
										{filteredSalas[index - 1]?.teatro.name !==
											filteredSalas[index].teatro.name && (
											<div className="rounded-t-md bg-gradient-to-br from-indigo-800 to-blue-700 px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
												<h2>{sala.teatro.name}</h2>
											</div>
										)}
										<SalaShort
											salaId={sala._id}
											obras={obras}
											selectedDate={selectedDate}
											filterObra={obras[selectedObraIndex]}
											rounded={
												index == filteredSalas.length ||
												filteredSalas[index + 1]?.teatro.name !==
													filteredSalas[index].teatro.name
											}
										/>
									</div>
								)
							})}
							{filteredSalas.length === 0 && (
								<p className="text-center text-xl font-semibold text-gray-700">
									No hay Espectáculos disponibles
								</p>
							)}
						</div>
					) : (
						<Loading />
					)}
				</div>
			</div>
		</>
	)
}

export default SalaListsByObra
