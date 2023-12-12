import {
	ChevronDownIcon,
	ChevronUpDownIcon,
	ChevronUpIcon,
	EyeIcon,
	EyeSlashIcon,
	FunnelIcon,
	InformationCircleIcon,
	MapIcon
} from '@heroicons/react/24/outline'
import { ArrowDownIcon, TrashIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

const Search = () => {
	const { auth } = useContext(AuthContext)
	const [isOpenFilter, setIsOpenFilter] = useState(true)
	const [isDeletingCheckedEspectaculos, setIsDeletingCheckedEspectaculos] = useState(false)
	const [deletedCheckedEspectaculos, setDeletedCheckedEspectaculos] = useState(0)
	const [isReleasingCheckedEspectaculos, setIsReleasingCheckedEspectaculos] = useState(false)
	const [releasedCheckedEspectaculos, setReleasedCheckedEspectaculos] = useState(0)
	const [isUnreleasingCheckedEspectaculos, setIsUnreleasingCheckedEspectaculos] = useState(false)
	const [unreleasedCheckedEspectaculos, setUnreleasedCheckedEspectaculos] = useState(0)
	const [isFetchingEspectaculosDone, setIsFetchingEspectaculosDone] = useState(false)

	const [espectaculos, setEspectaculos] = useState([])
	const [filterTeatro, setFilterTeatro] = useState(null)
	const [filterSala, setFilterSala] = useState(null)
	const [filterObra, setFilterObra] = useState(null)
	const [filterDate, setFilterDate] = useState(null)
	const [filterDateFrom, setFilterDateFrom] = useState(null)
	const [filterDateTo, setFilterDateTo] = useState(null)
	const [filterPastDate, setFilterPastDate] = useState(null)
	const [filterToday, setFilterToday] = useState(null)
	const [filterFutureDate, setFilterFutureDate] = useState(null)
	const [filterTime, setFilterTime] = useState(null)
	const [filterTimeFrom, setFilterTimeFrom] = useState(null)
	const [filterTimeTo, setFilterTimeTo] = useState(null)
	const [filterReleaseTrue, setFilterReleaseTrue] = useState(null)
	const [filterReleaseFalse, setFilterReleaseFalse] = useState(null)
	const [isCheckAll, setIsCheckAll] = useState(false)
	const [checkedEspectaculos, setCheckedEspectaculos] = useState([])

	const [sortTeatro, setSortTeatro] = useState(0) // -1: descendente, 0 sin clasificación, 1 ascendente
	const [sortSala, setSortSala] = useState(0)
	const [sortObra, setSortObra] = useState(0)
	const [sortDate, setSortDate] = useState(0)
	const [sortTime, setSortTime] = useState(0)
	const [sortBooked, setSortBooked] = useState(0)
	const [sortRelease, setSortRelease] = useState(0)

	const resetSort = () => {
		setSortTeatro(0)
		setSortSala(0)
		setSortObra(0)
		setSortDate(0)
		setSortTime(0)
		setSortBooked(0)
		setSortRelease(0)
	}

	const filteredEspectaculos = espectaculos
		.filter((espectaculo) => {
			const espectaculoDate = new Date(espectaculo.espectaculo)
			const year = espectaculoDate.getFullYear()
			const month = espectaculoDate.toLocaleString('default', { month: 'short' })
			const day = espectaculoDate.getDate().toString().padStart(2, '0')
			const formattedDate = `${day} ${month} ${year}`
			const hours = espectaculoDate.getHours().toString().padStart(2, '0')
			const minutes = espectaculoDate.getMinutes().toString().padStart(2, '0')
			const formattedTime = `${hours} : ${minutes}`
			return (
				(!filterTeatro || filterTeatro.map((teatro) => teatro.value).includes(espectaculo.sala.teatro._id)) &&
				(!filterSala || filterSala.map((sala) => sala.value).includes(espectaculo.sala.number)) &&
				(!filterObra || filterObra.map((obra) => obra.value).includes(espectaculo.obra._id)) &&
				(!filterDate || filterDate.map((espectaculo) => espectaculo.value).includes(formattedDate)) &&
				(!filterDateFrom || new Date(filterDateFrom.value) <= new Date(formattedDate)) &&
				(!filterDateTo || new Date(filterDateTo.value) >= new Date(formattedDate)) &&
				(!filterPastDate ||
					new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) >
						new Date(formattedDate)) &&
				(!filterToday ||
					(new Date().getFullYear() === new Date(formattedDate).getFullYear() &&
						new Date().getMonth() === new Date(formattedDate).getMonth() &&
						new Date().getDate() === new Date(formattedDate).getDate())) &&
				(!filterFutureDate ||
					new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) <
						new Date(formattedDate)) &&
				(!filterTime || filterTime.map((espectaculo) => espectaculo.value).includes(formattedTime)) &&
				(!filterTimeFrom || filterTimeFrom.value <= formattedTime) &&
				(!filterTimeTo || filterTimeTo.value >= formattedTime) &&
				(!filterReleaseTrue || espectaculo.isRelease) &&
				(!filterReleaseFalse || !espectaculo.isRelease)
			)
		})
		.sort((a, b) => {
			if (sortTeatro) {
				return sortTeatro * a.sala.teatro.name.localeCompare(b.sala.teatro.name)
			}
			if (sortSala) {
				return sortSala * (a.sala.number - b.sala.number)
			}
			if (sortObra) {
				return sortObra * a.obra.name.localeCompare(b.obra.name)
			}
			if (sortDate) {
				return sortDate * (new Date(a.espectaculo) - new Date(b.espectaculo))
			}
			if (sortTime) {
				return (
					sortTime *
					(new Date(a.espectaculo)
						.getHours()
						.toString()
						.padStart(2, '0')
						.concat(new Date(a.espectaculo).getMinutes().toString().padStart(2, '0')) -
						new Date(b.espectaculo)
							.getHours()
							.toString()
							.padStart(2, '0')
							.concat(new Date(b.espectaculo).getMinutes().toString().padStart(2, '0')))
				)
			}
			if (sortBooked) {
				return sortBooked * (a.seats.length - b.seats.length)
			}
			if (sortRelease) {
				return sortRelease * (a.isRelease - b.isRelease)
			}
		})

	const fetchEspectaculos = async (data) => {
		try {
			setIsFetchingEspectaculosDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/espectaculo/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/espectaculo')
			}
			// console.log(response.data.data)
			setEspectaculos(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingEspectaculosDone(true)
		}
	}

	useEffect(() => {
		fetchEspectaculos()
	}, [])

	const handleDeleteCheckedEspectaculos = () => {
		const confirmed = window.confirm(
			`¿Quieres eliminar ${checkedEspectaculos.length} espectáculos marcados, incluidas sus entradas?`
		)
		if (confirmed) {
			onDeleteCheckedEspectaculos()
		}
	}

	const onDeleteCheckedEspectaculos = async () => {
		setIsDeletingCheckedEspectaculos(true)
		setDeletedCheckedEspectaculos(0)
		let successCounter = 0
		let errorCounter = 0
		const deletePromises = checkedEspectaculos.map(async (checkedEspectaculo) => {
			try {
				const response = await axios.delete(`/espectaculo/${checkedEspectaculo}`, {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
				setDeletedCheckedEspectaculos((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(deletePromises)
		toast.success(`Eliminar ${successCounter} espectaculos marcados successful!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Error al borrar ${errorCounter} espectaculo marcado`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchEspectaculos()
		setIsDeletingCheckedEspectaculos(false)
	}

	const handleReleaseCheckedEspectaculos = () => {
		const confirmed = window.confirm(`¿Quieres reestrenar ${checkedEspectaculos.length} espectaculos marcados?`)
		if (confirmed) {
			onReleaseCheckedEspectaculos()
		}
	}

	const onReleaseCheckedEspectaculos = async () => {
		setIsReleasingCheckedEspectaculos(true)
		setReleasedCheckedEspectaculos(0)
		let successCounter = 0
		let errorCounter = 0
		const releasePromises = checkedEspectaculos.map(async (checkedEspectaculo) => {
			try {
				const response = await axios.put(
					`/espectaculo/${checkedEspectaculo}`,
					{ isRelease: true },
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
				setReleasedCheckedEspectaculos((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(releasePromises)
		toast.success(`¡Estrenar ${successCounter} espectáculos comprobados con éxito!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Error releasing ${errorCounter} checked espectaculo`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchEspectaculos()
		setIsReleasingCheckedEspectaculos(false)
	}

	const handleUnreleasedCheckedEspectaculos = () => {
		const confirmed = window.confirm(`Do you want to unreleased ${checkedEspectaculos.length} checked espectaculos?`)
		if (confirmed) {
			onUnreleasedCheckedEspectaculos()
		}
	}

	const onUnreleasedCheckedEspectaculos = async () => {
		setIsUnreleasingCheckedEspectaculos(true)
		setUnreleasedCheckedEspectaculos(0)
		let successCounter = 0
		let errorCounter = 0
		const releasePromises = checkedEspectaculos.map(async (checkedEspectaculo) => {
			try {
				const response = await axios.put(
					`/espectaculo/${checkedEspectaculo}`,
					{ isRelease: false },
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
				setUnreleasedCheckedEspectaculos((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(releasePromises)
		toast.success(`Unreleased ${successCounter} checked espectaculos successful!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Error unreleasing ${errorCounter} checked espectaculo`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchEspectaculos()
		setIsUnreleasingCheckedEspectaculos(false)
	}

	const resetState = () => {
		setIsCheckAll(false)
		setCheckedEspectaculos([])
	}

	const navigate = useNavigate()

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-2 rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Buscar Espectaculos</h2>
				<div className="flex flex-col gap-2 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4 transition-all duration-500 ease-in-out">
					<div className="flex items-center justify-between" onClick={() => setIsOpenFilter((prev) => !prev)}>
						<div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
							<FunnelIcon className="h-6 w-6" />
							Filtro
						</div>
						{!isOpenFilter && (
							<ChevronDownIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
						)}
						{isOpenFilter && (
							<ChevronUpIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
						)}
					</div>
					{isOpenFilter && (
						<div className="">
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Teatro :</h4>
								<Select
									value={filterTeatro}
									options={Array.from(
										new Set(espectaculos.map((espectaculo) => espectaculo.sala.teatro._id))
									).map((value) => ({
										value,
										label: espectaculos.find((espectaculo) => espectaculo.sala.teatro._id === value)
											.sala.teatro.name
									}))}
									onChange={(value) => {
										setFilterTeatro(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Sala :</h4>
								<Select
									value={filterSala}
									options={Array.from(new Set(espectaculos.map((espectaculo) => espectaculo.sala.number)))
										.sort((a, b) => a - b)
										.map((value) => ({
											value,
											label: value.toString()
										}))}
									onChange={(value) => {
										setFilterSala(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Obra :</h4>
								<Select
									value={filterObra}
									options={Array.from(new Set(espectaculos.map((espectaculo) => espectaculo.obra._id))).map(
										(value) => ({
											value,
											label: espectaculos.find((espectaculo) => espectaculo.obra._id === value).obra.name
										})
									)}
									onChange={(value) => {
										setFilterObra(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Fecha :</h4>
								<Select
									value={filterDate}
									options={Array.from(
										new Set(
											espectaculos.map((espectaculo) => {
												const espectaculoDate = new Date(espectaculo.espectaculo)
												const year = espectaculoDate.getFullYear()
												const month = espectaculoDate.toLocaleString('default', { month: 'short' })
												const day = espectaculoDate.getDate().toString().padStart(2, '0')
												return `${day} ${month} ${year}`
											})
										)
									).map((value) => ({
										value,
										label: value
									}))}
									onChange={(value) => {
										setFilterDate(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
								<div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center">
									<label className="text-md font-semibold text-gray-800">Desde</label>
									<Select
										value={filterDateFrom}
										options={Array.from(
											new Set(
												espectaculos.map((espectaculo) => {
													const espectaculoDate = new Date(espectaculo.espectaculo)
													const year = espectaculoDate.getFullYear()
													const month = espectaculoDate.toLocaleString('default', {
														month: 'short'
													})
													const day = espectaculoDate.getDate().toString().padStart(2, '0')
													return `${day} ${month} ${year}`
												})
											)
										)
											// .filter((value) => !filterDateTo || new Date(filterDateTo.value) >= new Date(value))
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterDateFrom(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
									<label className="text-md font-semibold text-gray-800">Hasta</label>
									<Select
										value={filterDateTo}
										options={Array.from(
											new Set(
												espectaculos.map((espectaculo) => {
													const espectaculoDate = new Date(espectaculo.espectaculo)
													const year = espectaculoDate.getFullYear()
													const month = espectaculoDate.toLocaleString('default', {
														month: 'short'
													})
													const day = espectaculoDate.getDate().toString().padStart(2, '0')
													return `${day} ${month} ${year}`
												})
											)
										)
											// .filter((value) => !filterDateFrom || new Date(filterDateFrom.value) <= new Date(value))
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterDateTo(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
								</div>
								<div className="flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center">
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Fecha Pasada
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterPastDate}
											onClick={(event) => {
												setFilterPastDate(event.target.checked)
												setFilterToday(false)
												setFilterFutureDate(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Hoy
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterToday}
											onClick={(event) => {
												setFilterPastDate(false)
												setFilterToday(event.target.checked)
												setFilterFutureDate(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Fecha Futuro
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterFutureDate}
											onClick={(event) => {
												setFilterPastDate(false)
												setFilterToday(false)
												setFilterFutureDate(event.target.checked)
												resetState()
											}}
										/>
									</label>
								</div>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Time :</h4>
								<Select
									value={filterTime}
									options={Array.from(
										new Set(
											espectaculos.map((espectaculo) => {
												const espectaculoDate = new Date(espectaculo.espectaculo)
												const hours = espectaculoDate.getHours().toString().padStart(2, '0')
												const minutes = espectaculoDate.getMinutes().toString().padStart(2, '0')
												return `${hours} : ${minutes}`
											})
										)
									)
										.sort()
										.map((value) => ({
											value,
											label: value
										}))}
									onChange={(value) => {
										setFilterTime(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
								<div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center">
									<label className="text-md font-semibold text-gray-800">Desde</label>
									<Select
										value={filterTimeFrom}
										options={Array.from(
											new Set(
												espectaculos.map((espectaculo) => {
													const espectaculoDate = new Date(espectaculo.espectaculo)
													const hours = espectaculoDate.getHours().toString().padStart(2, '0')
													const minutes = espectaculoDate
														.getMinutes()
														.toString()
														.padStart(2, '0')
													return `${hours} : ${minutes}`
												})
											)
										)
											.sort()
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterTimeFrom(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
									<label className="text-md font-semibold text-gray-800">Hasta</label>
									<Select
										value={filterTimeTo}
										options={Array.from(
											new Set(
												espectaculos.map((espectaculo) => {
													const espectaculoDate = new Date(espectaculo.espectaculo)
													const hours = espectaculoDate.getHours().toString().padStart(2, '0')
													const minutes = espectaculoDate
														.getMinutes()
														.toString()
														.padStart(2, '0')
													return `${hours} : ${minutes}`
												})
											)
										)
											.sort()
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterTimeTo(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
								</div>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Estrenado :</h4>
								<div className="mt-1 flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center">
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Verdadero
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterReleaseTrue}
											onClick={(event) => {
												setFilterReleaseTrue(event.target.checked)
												setFilterReleaseFalse(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Falso
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterReleaseFalse}
											onClick={(event) => {
												setFilterReleaseTrue(false)
												setFilterReleaseFalse(event.target.checked)
												resetState()
											}}
										/>
									</label>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="flex items-end">
					<ArrowDownIcon className="h-8 min-h-[32px] w-8 min-w-[32px] px-1" />
					<div className="flex flex-wrap items-center gap-2 px-1">
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleReleaseCheckedEspectaculos()}
							disabled={checkedEspectaculos.length === 0 || isReleasingCheckedEspectaculos}
						>
							{isReleasingCheckedEspectaculos ? (
								`${releasedCheckedEspectaculos} / ${checkedEspectaculos.length} espectaculos released`
							) : (
								<>
									<EyeIcon className="h-5 w-5" />
									{`Release ${checkedEspectaculos.length} checked espectaculos`}
								</>
							)}
						</button>
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleUnreleasedCheckedEspectaculos()}
							disabled={checkedEspectaculos.length === 0 || isUnreleasingCheckedEspectaculos}
						>
							{isUnreleasingCheckedEspectaculos ? (
								`${unreleasedCheckedEspectaculos} / ${checkedEspectaculos.length} espectaculos unreleased`
							) : (
								<>
									<EyeSlashIcon className="h-5 w-5" />
									{`Unreleased ${checkedEspectaculos.length} checked espectaculos`}
								</>
							)}
						</button>
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-gradient-to-r from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-500 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleDeleteCheckedEspectaculos()}
							disabled={checkedEspectaculos.length === 0 || isDeletingCheckedEspectaculos}
						>
							{isDeletingCheckedEspectaculos ? (
								`${deletedCheckedEspectaculos} / ${checkedEspectaculos.length} espectaculos deleted`
							) : (
								<>
									<TrashIcon className="h-5 w-5" />
									{`Delete ${checkedEspectaculos.length} checked espectaculos`}
								</>
							)}
						</button>
					</div>

					{isFetchingEspectaculosDone && (
						<div className="ml-auto flex items-center gap-1 px-1 text-sm font-medium">
							<InformationCircleIcon className="h-5 w-5" /> Mostrando {filteredEspectaculos.length} filtrado
							espectaculos
						</div>
					)}
				</div>

				<div
					className={`mb-4 grid max-h-screen overflow-auto rounded-md bg-gradient-to-br from-indigo-100 to-white`}
					style={{ gridTemplateColumns: '34px repeat(7, minmax(max-content, 1fr)) 104px' }}
				>
					<p className="sticky top-0 flex items-center justify-center rounded-tl-md bg-gradient-to-br from-gray-800 to-gray-700 text-center text-xl font-semibold text-white">
						<input
							type="checkbox"
							className="h-6 w-6"
							checked={isCheckAll}
							onChange={() => {
								if (isCheckAll) {
									setIsCheckAll(false)
									setCheckedEspectaculos([])
								} else {
									setIsCheckAll(true)
									setCheckedEspectaculos((prev) => [
										...prev,
										...filteredEspectaculos.map((espectaculo) => espectaculo._id)
									])
								}
							}}
							disabled={!isFetchingEspectaculosDone}
						/>
					</p>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortTeatro
							resetSort()
							setSortTeatro(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Teatro</p>
						{sortTeatro === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortTeatro === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortTeatro === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortSala
							resetSort()
							setSortSala(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Sala</p>
						{sortSala === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortSala === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortSala === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortObra
							resetSort()
							setSortObra(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Obra</p>
						{sortObra === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortObra === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortObra === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortDate
							resetSort()
							setSortDate(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Date</p>
						{sortDate === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortDate === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortDate === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortTime
							resetSort()
							setSortTime(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Time</p>
						{sortTime === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortTime === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortTime === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortBooked
							resetSort()
							setSortBooked(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Reservado</p>
						{sortBooked === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortBooked === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortBooked === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortRelease
							resetSort()
							setSortRelease(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Estrenado</p>
						{sortRelease === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortRelease === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortRelease === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<p className="sticky top-0 z-[1] flex items-center justify-center gap-2 rounded-tr-md bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						<MapIcon className="h-6 w-6" />
						Vista
					</p>
					{isFetchingEspectaculosDone &&
						filteredEspectaculos.map((espectaculo, index) => {
							const espectaculoDate = new Date(espectaculo.espectaculo)
							const year = espectaculoDate.getFullYear()
							const month = espectaculoDate.toLocaleString('default', { month: 'short' })
							const day = espectaculoDate.getDate().toString().padStart(2, '0')
							const hours = espectaculoDate.getHours().toString().padStart(2, '0')
							const minutes = espectaculoDate.getMinutes().toString().padStart(2, '0')
							const isCheckedRow = checkedEspectaculos.includes(espectaculo._id)
							return (
								<Fragment key={index}>
									<div
										className={`flex items-center justify-center border-t-2 border-indigo-200 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										<input
											id={espectaculo._id}
											type="checkbox"
											className="h-6 w-6"
											checked={checkedEspectaculos.includes(espectaculo._id)}
											onChange={(e) => {
												const { id, checked } = e.target
												setCheckedEspectaculos((prev) => [...prev, id])
												if (!checked) {
													setCheckedEspectaculos((prev) => prev.filter((item) => item !== id))
												}
											}}
											disabled={!isFetchingEspectaculosDone}
										/>
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{espectaculo.sala.teatro.name}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{espectaculo.sala.number}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{espectaculo.obra.name}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>{`${day} ${month} ${year}`}</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>{`${hours} : ${minutes}`}</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{espectaculo.seats.length}
									</div>
									<div
										className={`flex items-center gap-2 border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										<p>
											{String(espectaculo.isRelease).charAt(0).toUpperCase() +
												String(espectaculo.isRelease).slice(1)}
										</p>
										{!espectaculo.isRelease && (
											<EyeSlashIcon className="h-5 w-5" title="Unreleased espectaculo" />
										)}
									</div>
									<button
										className="flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-blue-500 px-2 py-1 text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
										onClick={() => navigate(`/espectaculo/${espectaculo._id}`)}
									>
										<MapIcon className="h-6 w-6" />
										Vista
									</button>
								</Fragment>
							)
						})}
				</div>
				{!isFetchingEspectaculosDone && <Loading />}
			</div>
		</div>
	)
}

export default Search
