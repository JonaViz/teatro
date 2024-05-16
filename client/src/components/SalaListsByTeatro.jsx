import {
	ArrowsRightLeftIcon,
	ArrowsUpDownIcon,
	CheckIcon,
	PencilSquareIcon,
	TrashIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DateSelector from './DateSelector'
import Sala from './Sala.jsx'


const SalaListsByTeatro = ({ teatros, selectedTeatroIndex, setSelectedTeatroIndex, fetchTeatros, auth }) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const {
		register: registerName,
		handleSubmit: handleSubmitName,
		setValue: setValueName,
		formState: { errors: errorsName }
	} = useForm()

	const [obras, setObras] = useState()
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [isIncreasing, SetIsIncreaseing] = useState(false)
	const [isDeleting, SetIsDeleting] = useState(false)
	const [isDecreasing, SetIsDecreasing] = useState(false)
	const [isEditing, SetIsEditing] = useState(false)

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
		SetIsEditing(false)
		setValueName('name', teatros[selectedTeatroIndex].name)
	}, [teatros[selectedTeatroIndex].name])

	const handleDelete = (teatro) => {
		const confirmed = window.confirm(
			`¿Quieres eliminar el teatro ${teatro.name}, incluyendo sus salas, espectáculos y entradas?`
		)
		if (confirmed) {
			onDeleteTeatro(teatro._id)
		}
	}

	const onDeleteTeatro = async (id) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/teatro/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			setSelectedTeatroIndex(null)
			fetchTeatros()
			toast.success('Delete Teatro successful!', {
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
			SetIsDeleting(false)
		}
	}

	const onIncreaseSala = async (data) => {
		try {
			SetIsIncreaseing(true)
			const response = await axios.post(
				`/sala`,
				{
					teatro: teatros[selectedTeatroIndex]._id,
					number: teatros[selectedTeatroIndex].salas.length + 1,
					row: data.row.toUpperCase(),
					column: data.column,
					precio: data.precio,
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			fetchTeatros()
			// console.log(response.data)
			toast.success('se agrego la sala correctamente!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(errors, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsIncreaseing(false)
		}
	}

	const handleDecreaseSala = (teatro) => {
		const confirmed = window.confirm(
			`¿Quieres eliminar sala ${teatros[selectedTeatroIndex].salas.length}?, incluyendo sus espectáculos y entradas`
		)
		if (confirmed) {
			onDecreaseSala()
		}
	}

	const onDecreaseSala = async () => {
		try {
			SetIsDecreasing(true)
			const response = await axios.delete(`/sala/${teatros[selectedTeatroIndex].salas.slice(-1)[0]._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchTeatros()
			toast.success('Disminuir sala successful!', {
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
			SetIsDecreasing(false)
		}
	}

	const onEditTeatro = async (data) => {
		try {
			const response = await axios.put(
				`/teatro/${teatros[selectedTeatroIndex]._id}`,
				{
					name: data.name
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			fetchTeatros(data.name)
			toast.success('Nombre del Teatro editado correctamente!', {
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
		}
	}

	return (
		<div className="mx-4 h-fit rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 text-gray-900 drop-shadow-md sm:mx-8">
			<div className="flex items-center justify-center gap-2 rounded-t-md bg-gradient-to-br from-gray-900 to-gray-800 px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
				{isEditing ? (
					<input
						title="Nombre Teatro"
						type="text"
						required
						autoFocus
						className={`flex-grow rounded border border-white bg-gradient-to-br from-gray-900 to-gray-800 px-1 text-center text-2xl font-semibold drop-shadow-sm sm:text-3xl ${
							errorsName.name && 'border-2 border-red-500'
						}`}
						{...registerName('name', { required: true })}
					/>
				) : (
					<span className="flex-grow text-2xl sm:text-3xl">{teatros[selectedTeatroIndex]?.name}</span>
				)}
				{auth.role === 'admin' && (
					<>
						{isEditing ? (
							<form onClick={handleSubmitName(onEditTeatro)}>
								<button
									title="Guardar Nombre Teatro"
									className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400"
									onClick={() => {
										SetIsEditing(false)
									}}
								>
									GUARDAR
									<CheckIcon className="h-5 w-5" />
								</button>
							</form>
						) : (
							<button
								title="Editar nombre Teatro "
								className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400"
								onClick={() => SetIsEditing(true)}
							>
								EDITAR
								<PencilSquareIcon className="h-5 w-5" />
							</button>
						)}
						<button
							title="Borrar Teatro"
							disabled={isDeleting}
							className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-600 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDelete(teatros[selectedTeatroIndex])}
						>
							{isDeleting ? (
								'Procesando...'
							) : (
								<>
									BORRAR
									<TrashIcon className="h-5 w-5" />
								</>
							)}
						</button>
					</>
				)}
			</div>
			<div className="flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto">
				<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onIncreaseSala)}>
					<h2 className="text-3xl font-bold">Salas</h2>
					{auth.role === 'admin' && (
						<div className="flex w-full flex-wrap justify-between gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4">
							<h3 className="flex items-center text-xl font-bold">Agregar Sala</h3>
							<div className="flex items-center gap-4"> 
								<label className="text-lg font-semibold leading-5">          Precio de Pullman:</label>
								<input
									title={errors.precio ? errors.precio.message : 'Precio de la sala'}
									type="number"
									min="0"
									step="any"
									required
									className={`w-15 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3 ${
									errors.precio && 'border-2 border-red-500'
									}`}
									{...register('precio', { required: true })}
								/>
								</div>
							<div className="flex grow flex-col gap-4 sm:justify-end md:flex-row">
								<div className="flex flex-wrap justify-end gap-4">
									<div className="flex flex-wrap gap-2">
										<ArrowsUpDownIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Última fila :</label>
											<label className="text-xs font-semibold">(A-DZ)</label>
										</div>
										<input
											title={errors.row ? errors.row.message : 'A to DZ'}
											type="text"
											maxLength="2"
											required
											className={`w-14 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3
											${errors.row && 'border-2 border-red-500'}`}
											{...register('row', {
												required: true,
												pattern: {
													value: /^([A-Da-d][A-Za-z]|[A-Za-z])$/,
													message: 'Fila Invalida'
												}
											})}
										/>
									</div>
									<div className="flex flex-wrap gap-2">
										<ArrowsRightLeftIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Última columna :</label>
											<label className="text-xs font-semibold">(1-120)</label>
										</div>
										<input
											title={errors.column ? errors.column.message : '1 to 120'}
											type="number"
											min="1"
											max="120"
											maxLength="3"
											required
											className={`w-24 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3 ${
												errors.column && 'border-2 border-red-500'
											}`}
											{...register('column', { required: true })}
										/>
									</div>
								</div>
								<div className="flex grow md:grow-0">
									<div className="flex flex-col items-center justify-center gap-1 rounded-l bg-gradient-to-br from-gray-800 to-gray-700 p-1 text-white">
										<label className="text-xs font-semibold leading-3">Numero</label>
										<label className="text-2xl font-semibold leading-5">
											{teatros[selectedTeatroIndex].salas.length + 1}
										</label>
									</div>
									<button
										title="Agregar sala"
										disabled={isIncreasing}
										className="flex grow items-center justify-center whitespace-nowrap rounded-r bg-gradient-to-r from-indigo-600 to-blue-500 px-2 py-1 font-medium text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:grow-0"
										type="submit"
									>
										{isIncreasing ? 'Procesando...' : 'ADD +'}
									</button>
								</div>
							</div>
						</div>
					)}
				</form>
				{teatros[selectedTeatroIndex].salas.map((sala, index) => {
					return (
						<Sala
							key={index}
							salaId={sala._id}
							obras={obras}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					)
				})}
				{auth.role === 'admin' && teatros[selectedTeatroIndex].salas.length > 0 && (
					<div className="flex justify-center">
						<button
							title="Borrar ultima sala"
							className="w-fit rounded-md bg-gradient-to-r from-red-700 to-rose-600 px-2 py-1 font-medium text-white drop-shadow-md hover:from-red-600 hover:to-rose-500 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDecreaseSala()}
							disabled={isDecreasing}
						>
							{isDecreasing ? 'Procesando...' : 'BORRAR ULTIMA SALA -'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default SalaListsByTeatro
