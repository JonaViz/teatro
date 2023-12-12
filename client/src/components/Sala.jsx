import { ArrowsRightLeftIcon, ArrowsUpDownIcon, InformationCircleIcon, UserIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import Loading from './Loading'
import Espectaculos from './Espectaculos.jsx'

const Sala = ({ salaId, obras, selectedDate, filterObra, setSelectedDate }) => {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		getValues,
		watch,
		formState: { errors }
	} = useForm()

	const { auth } = useContext(AuthContext)

	const [sala, setSala] = useState({})
	const [isFetchingSalaDone, setIsFetchingSalaDone] = useState(false)
	const [isAddingEspectaculo, SetIsAddingEspectaculo] = useState(false)
	const [selectedObra, setSelectedObra] = useState(null)

	const fetchSala = async (data) => {
		try {
			setIsFetchingSalaDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get(`/sala/unreleased/${salaId}`, {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get(`/sala/${salaId}`)
			}
			// console.log(response.data.data)
			setSala(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingSalaDone(true)
		}
	}

	useEffect(() => {
		fetchSala()
	}, [salaId])

	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	const onAddEspectaculo = async (data) => {
		try {
			SetIsAddingEspectaculo(true)
			if (!data.obra) {
				toast.error('Please select a obra', {
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
				{ obra: data.obra, espectaculo, sala: sala._id, repeat: data.repeat, isRelease: data.isRelease },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			fetchSala()
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

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // Convierte el carácter a ASCII y ajústelo al índice basado en 1
			result = result * 26 + charCode
		}
		return result
	}

	if (!isFetchingSalaDone) {
		return <Loading />
	}

	return (
		<div className="flex flex-col">
			<div className="flex md:justify-between">
				<h3
					className={`flex w-fit items-center rounded-tl-2xl bg-gradient-to-br from-gray-800 to-gray-700 px-6 py-0.5 text-2xl font-bold text-white md:rounded-t-2xl md:px-8 ${
						auth.role !== 'admin' && 'rounded-t-2xl'
					}`}
				>
					{sala.number}
				</h3>
				{auth.role === 'admin' && (
					<div className="flex w-fit flex-col gap-x-3 rounded-tr-2xl bg-gradient-to-br from-indigo-800 to-blue-700 px-4 py-0.5 font-semibold text-white md:flex-row md:gap-x-6 md:rounded-t-2xl md:text-lg md:font-bold">
						<div className="flex items-center gap-2">
							<ArrowsUpDownIcon className="h-5 w-5" />
							{sala?.seatPlan?.row === 'A' ? (
								<h4>Fila : A</h4>
							) : (
								<h4>Fila : A - {sala?.seatPlan?.row}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<ArrowsRightLeftIcon className="h-5 w-5" />
							{sala?.seatPlan?.column === 1 ? (
								<h4>Columna : 1</h4>
							) : (
								<h4>Columna : 1 - {sala?.seatPlan?.column}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							{(rowToNumber(sala.seatPlan.row) * sala.seatPlan.column).toLocaleString('en-US')}{' '}
							Butaca
						</div>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-4 rounded-b-md rounded-tr-md bg-gradient-to-br from-indigo-100 to-white py-4 md:rounded-tr-none">
				{auth.role === 'admin' && (
					<>
						<form
							className="mx-4 flex flex-col gap-x-4 gap-y-2 lg:flex-row"
							onSubmit={handleSubmit(onAddEspectaculo)}
						>
							<div className="flex grow flex-col gap-2 rounded-lg">
								<div className="flex flex-col gap-2 rounded-lg lg:flex-row lg:items-stretch">
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
										Estrenar Ahora:
										<input
											type="checkbox"
											className="h-6 w-6 lg:h-9 lg:w-9"
											{...register('isRelease')}
										/>
									</label>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
										<p className="font-semibold text-right underline">Aumento automático</p>
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
											title="Después de agregar, actualice el valor de la fecha a la hora de finalización de la obra."
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
										title="Brecha entre espectaculos"
									>
										<label className="whitespace-nowrap font-semibold leading-5">Espera:</label>
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
						{filterObra?.name && (
							<div className="mx-4 flex gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 p-2 text-white">
								<InformationCircleIcon className="h-6 w-6" />
								{`You are viewing the espectaculos of "${filterObra?.name}"`}
							</div>
						)}
					</>
				)}
				<Espectaculos
					espectaculos={sala.espectaculos}
					obras={obras}
					selectedDate={selectedDate}
					filterObra={filterObra}
				/>
			</div>
		</div>
	)
}
export default Sala
