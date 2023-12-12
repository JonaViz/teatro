import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TeatroLists from '../components/TeatroLists.jsx'
import DateSelector from '../components/DateSelector'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import CronogramaTable from '../components/CronogramaTable.jsx'
import { AuthContext } from '../context/AuthContext'

const Cronograma = () => {
	const { auth } = useContext(AuthContext)
	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors }
	} = useForm()
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [selectedTeatroIndex, setSelectedTeatroIndex] = useState(
		parseInt(sessionStorage.getItem('selectedTeatroIndex')) || 0
	)
	const [teatros, setTeatros] = useState([])
	const [isFetchingTeatros, setIsFetchingTeatros] = useState(true)
	const [obras, setObras] = useState()
	const [isAddingEspectaculo, SetIsAddingEspectaculo] = useState(false)
	const [selectedObra, setSelectedObra] = useState(null)

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

	const fetchObras = async (data) => {
		try {
			const response = await axios.get('/obra')
			// console.log(response.data.data)
			setObras(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchObras()
	}, [])

	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	const onAddEspectaculo = async (data) => {
		try {
			SetIsAddingEspectaculo(true)
			if (!data.obra) {
				toast.error('Por favor elige una obra', {
					position: 'top-center',
					autoClose: 2000,
					pauseOnHover: false
				})
				return
			}
			let espectaculo = new Date(selectedDate)
			const [hours, minutes] = data.espectaculo.split(':')
			espectaculo.setHours(hours, minutes, 0)
			const response = await axios.post(
				'/espectaculo',
				{ obra: data.obra, espectaculo, sala: data.sala, repeat: data.repeat, isRelease: data.isRelease },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			fetchTeatros()
			if (data.autoIncrease) {
				const obraLength = obras.find((obra) => obra._id === data.obra).length
				const [GapHours, GapMinutes] = data.gap.split(':').map(Number)
				const nextEspectaculo = new Date(espectaculo.getTime() + (obraLength + GapHours * 60 + GapMinutes) * 60000)
				if (data.rounding5 || data.rounding10) {
					const totalMinutes = nextEspectaculo.getHours() * 60 + nextEspectaculo.getMinutes()
					const roundedMinutes = data.rounding5
						? Math.ceil(totalMinutes / 5) * 5
						: Math.ceil(totalMinutes / 10) * 10
					let roundedHours = Math.floor(roundedMinutes / 60)
					const remainderMinutes = roundedMinutes % 60
					if (roundedHours === 24) {
						nextEspectaculo.setDate(nextEspectaculo.getDate() + 1)
						roundedHours = 0
					}
					setValue(
						'espectaculo',
						`${String(roundedHours).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`
					)
				} else {
					setValue(
						'espectaculo',
						`${String(nextEspectaculo.getHours()).padStart(2, '0')}:${String(
							nextEspectaculo.getMinutes()
						).padStart(2, '0')}`
					)
				}
				if (data.autoIncreaseDate) {
					setSelectedDate(nextEspectaculo)
					sessionStorage.setItem('selectedDate', nextEspectaculo)
				}
			}
			toast.success('Add espectaculo successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsAddingEspectaculo(false)
		}
	}

	const props = {
		teatros,
		selectedTeatroIndex,
		setSelectedTeatroIndex,
		fetchTeatros,
		auth,
		isFetchingTeatros
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<TeatroLists {...props} />
			{selectedTeatroIndex !== null &&
				(teatros[selectedTeatroIndex]?.salas?.length ? (
					<div className="mx-4 flex flex-col gap-2 rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:gap-4 sm:p-6">
						<h2 className="text-3xl font-bold text-gray-900">Cronograma</h2>
						<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
						{auth.role === 'admin' && (
							<form
								className="flex flex-col lg:flex-row gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4"
								onSubmit={handleSubmit(onAddEspectaculo)}
							>
								<div className="flex grow flex-col gap-2 rounded-lg">
									<div className="flex flex-col gap-2 rounded-lg lg:flex-row lg:items-stretch">
										<div className="flex grow items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg font-semibold leading-5">
												Sala:
											</label>
											<select
												className="h-9 w-full rounded bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm"
												required
												{...register('sala', { required: true })}
											>
												<option value="" defaultValue>
													Elige la sala
												</option>
												{teatros[selectedTeatroIndex].salas?.map((sala, index) => {
													return (
														<option key={index} value={sala._id}>
															{sala.number}
														</option>
													)
												})}
											</select>
										</div>
										<div className="flex grow-[2] items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg font-semibold leading-5">
												Obra:
											</label>
											<Select
												value={selectedObra}
												options={obras?.map((obra) => ({
													value: obra._id,
													label: obra.name
												}))}
												onChange={(value) => {
													setValue('obra', value.value)
													setSelectedObra(value)
												}}
												isSearchable={true}
												primaryColor="indigo"
												classNames={{
													menuButton: (value) =>
														'flex font-semibold text-sm border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none bg-white hover:border-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20'
												}}
											/>
										</div>
										<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg font-semibold leading-5">
												Espectaculo:
											</label>
											<input
												type="time"
												className="h-9 w-full rounded bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm"
												required
												{...register('espectaculo', { required: true })}
											/>
										</div>
									</div>
									<div className="flex flex-col gap-2 rounded-lg lg:flex-row lg:items-stretch">
										<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg font-semibold leading-5">
												Repetir (Dias):
											</label>
											<input
												type="number"
												min={1}
												defaultValue={1}
												max={31}
												className="h-9 w-full rounded bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm"
												required
												{...register('repeat', { required: true })}
											/>
										</div>
										<label className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap text-lg font-semibold leading-5 lg:flex-col lg:items-start">
											Estrenar ahora:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												{...register('isRelease')}
											/>
										</label>
										<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
											<p className="font-semibold text-right underline">Auto incrementar</p>
											<label
												className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
												title="Después de agregar, actualice el valor del espectáculo a la hora de finalización de la obra."
											>
												Espectaculo:
												<input
													type="checkbox"
													className="h-6 w-6 lg:h-9 lg:w-9"
													{...register('autoIncrease')}
												/>
											</label>
											<label
												className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
												title="Después de agregar, actualizar el valor de la fecha a la hora de finalización de la obra."
											>
												Fecha:
												<input
													type="checkbox"
													className="h-6 w-6 lg:h-9 lg:w-9"
													disabled={!watch('autoIncrease')}
													{...register('autoIncreaseDate')}
												/>
											</label>
										</div>
										<div
											className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start"
											title="Brecha entre espectáculos"
										>
											<label className="whitespace-nowrap font-semibold leading-5">Brecha:</label>
											<input
												type="time"
												className="h-9 w-full rounded bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm disabled:bg-gray-300"
												disabled={!watch('autoIncrease')}
												{...register('gap')}
											/>
										</div>
										<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
											<p className="font-semibold text-right underline">Redondeo</p>
											<label
												className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
												title="Redondeando a los cinco minutos más cercanos"
											>
												5-min:
												<input
													type="checkbox"
													className="h-6 w-6 lg:h-9 lg:w-9"
													disabled={!watch('autoIncrease')}
													{...register('rounding5', {
														onChange: () => setValue('rounding10', false)
													})}
												/>
											</label>
											<label
												className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
												title="Redondeando a los diez minutos más cercanos"
											>
												10-min:
												<input
													type="checkbox"
													className="h-6 w-6 lg:h-9 lg:w-9"
													disabled={!watch('autoIncrease')}
													{...register('rounding10', {
														onChange: () => setValue('rounding5', false)
													})}
												/>
											</label>
										</div>
									</div>
								</div>
								<button
									title="Agregar espectaculo"
									disabled={isAddingEspectaculo}
									className="whitespace-nowrap rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 px-2 py-1 font-medium text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
									type="submit"
								>
									AGREGAR +
								</button>
							</form>
						)}
						{isFetchingTeatros ? (
							<Loading />
						) : (
							<div>
								<h2 className="text-2xl font-bold">Salas</h2>
								{teatros[selectedTeatroIndex]?._id && (
									<CronogramaTable
										teatro={teatros[selectedTeatroIndex]}
										selectedDate={selectedDate}
										auth={auth}
									/>
								)}
							</div>
						)}
					</div>
				) : (
					<div className="mx-4 flex flex-col gap-2 rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:gap-4 sm:p-6">
						<p className="text-center">No hay salas disponibles</p>
					</div>
				))}
		</div>
	)
}

export default Cronograma
