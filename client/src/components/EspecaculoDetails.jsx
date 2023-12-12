import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { TrashIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const EspecaculoDetails = ({ showDeleteBtn, espectaculo, fetchEspectaculo }) => {
	const { auth } = useContext(AuthContext)
	const navigate = useNavigate()
	const [isDeletingEspectaculos, SetIsDeletingEspectaculos] = useState(false)
	const [isReleasingEspectaculo, setIsReleasingEspectaculo] = useState(false)
	const [isUnreleasingEspectaculo, setIsUnreleasingEspectaculo] = useState(false)

	const handleDelete = () => {
		const confirmed = window.confirm(`¿Quieres eliminar este espectáculo, incluidas sus entradas?
		`)
		if (confirmed) {
			onDeleteEspectaculo()
		}
	}

	const onDeleteEspectaculo = async () => {
		try {
			SetIsDeletingEspectaculos(true)
			const response = await axios.delete(`/espectaculo/${espectaculo._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			navigate('/teatro')
			toast.success('Delete espectaculo successful!', {
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
			SetIsDeletingEspectaculos(false)
		}
	}

	const handleReleaseEspectaculo = () => {
		const confirmed = window.confirm(`¿Quieres estrenar este espectaculo?
		`)
		if (confirmed) {
			onReleaseEspectaculo()
		}
	}

	const onReleaseEspectaculo = async () => {
		setIsReleasingEspectaculo(true)
		try {
			const response = await axios.put(
				`/espectaculo/${espectaculo._id}`,
				{ isRelease: true },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			await fetchEspectaculo()
			toast.success(`Estreno del espectaculo successful!`, {
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
			setIsReleasingEspectaculo(false)
		}
	}

	const handleUnreleasedEspectaculo = () => {
		const confirmed = window.confirm(`Quieres re estrenar este espectaculo?`)
		if (confirmed) {
			onUnreleasedEspectaculo()
		}
	}

	const onUnreleasedEspectaculo = async () => {
		setIsUnreleasingEspectaculo(true)
		try {
			const response = await axios.put(
				`/espectaculo/${espectaculo._id}`,
				{ isRelease: false },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			await fetchEspectaculo()
			toast.success(`Reestreno de espectaculo successful!`, {
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
			setIsUnreleasingEspectaculo(false)
		}
	}

	return (
		<>
			{showDeleteBtn && auth.role === 'admin' && (
				<div className="mb-4 flex justify-end gap-2">
					{!espectaculo.isRelease && (
						<button
							title="Editar nombre del teatro"
							className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleReleaseEspectaculo(true)}
							disabled={isReleasingEspectaculo}
						>
							{isReleasingEspectaculo ? (
								'Procesando...'
							) : (
								<>
									REESTRENAR
									<EyeIcon className="h-5 w-5" />
								</>
							)}
						</button>
					)}
					{espectaculo.isRelease && (
						<button
							title="Editar nombre del teatro"
							className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleUnreleasedEspectaculo(true)}
							disabled={isUnreleasingEspectaculo}
						>
							{isUnreleasingEspectaculo ? (
								'Procesando...'
							) : (
								<>
									REESTRENAR
									<EyeSlashIcon className="h-5 w-5" />
								</>
							)}
						</button>
					)}
					<button
						className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-600 disabled:from-slate-500 disabled:to-slate-400"
						onClick={() => handleDelete()}
						disabled={isDeletingEspectaculos}
					>
						{isDeletingEspectaculos ? (
							'Procesando...'
						) : (
							<>
								BORRAR
								<TrashIcon className="h-5 w-5" />
							</>
						)}
					</button>
				</div>
			)}
			<div className="flex justify-between">
				<div className="flex flex-col justify-center rounded-tl-lg bg-gradient-to-br from-gray-800 to-gray-700 px-4 py-0.5 text-center font-bold text-white sm:px-8">
					<p className="text-sm">Sala</p>
					<p className="text-3xl">{espectaculo?.sala?.number}</p>
				</div>
				<div className="flex w-fit grow items-center justify-center rounded-tr-lg bg-gradient-to-br from-indigo-800 to-blue-700 px-4 py-0.5 text-center text-xl font-bold text-white sm:text-3xl">
					<p className="mx-auto">{espectaculo?.sala?.teatro.name}</p>
					{!espectaculo?.isRelease && <EyeSlashIcon className="h-8 w-8" title="Reestrenar espectaculo" />}
				</div>
			</div>
			<div className="flex flex-col md:flex-row">
				<div className="flex grow flex-col gap-4 bg-gradient-to-br from-indigo-100 to-white py-2 drop-shadow-lg sm:py-4">
					<div className="flex items-center">
						<img src={espectaculo?.obra?.img} className="w-32 px-4 drop-shadow-md" />
						<div className="flex flex-col">
							<h4 className="mr-4 text-xl font-semibold sm:text-2xl md:text-3xl">
								{espectaculo?.obra?.name}
							</h4>
							{espectaculo?.obra && (
								<p className="mr-4 font-medium sm:text-lg">
									duración : {espectaculo?.obra?.length || '-'} min
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col">
					<div className="flex h-full min-w-max flex-col items-center justify-center gap-y-1 bg-gradient-to-br from-indigo-100 to-white py-2 text-center text-xl font-semibold drop-shadow-lg sm:py-4 sm:text-2xl md:items-start">
						<p className="mx-4 text-lg leading-4 ">
							{espectaculo?.espectaculo &&
								`${new Date(espectaculo?.espectaculo).toLocaleString('default', { weekday: 'long' })}`}
						</p>
						<p className="mx-4 ">
							{espectaculo?.espectaculo &&
								`${new Date(espectaculo?.espectaculo).getDate()}
               					 ${new Date(espectaculo?.espectaculo).toLocaleString('default', { month: 'long' })}
                				${new Date(espectaculo?.espectaculo).getFullYear()}`}
						</p>
						<p className="mx-4 bg-gradient-to-r from-indigo-800 to-blue-700 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
							{espectaculo?.espectaculo &&
								`${new Date(espectaculo?.espectaculo).getHours().toString().padStart(2, '0')} : ${new Date(
									espectaculo?.espectaculo
								)
									.getMinutes()
									.toString()
									.padStart(2, '0')}`}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

export default EspecaculoDetails
