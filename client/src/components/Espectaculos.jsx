import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Espectaculos = ({ espectaculos, obras, selectedDate, filterObra, showObraDetail = true }) => {
	const { auth } = useContext(AuthContext)

	const navigate = useNavigate()
	const sortedEspectaculos = espectaculos?.reduce((result, espectaculo) => {
		const { obra, espectaculo: showDateTime, seats, _id, isRelease } = espectaculo

		if (filterObra && filterObra._id !== obra) {
			return result // skip
		}

		if (
			new Date(showDateTime).getDate() === selectedDate.getDate() &&
			new Date(showDateTime).getMonth() === selectedDate.getMonth() &&
			new Date(showDateTime).getFullYear() === selectedDate.getFullYear()
		) {
			if (!result[obra]) {
				result[obra] = []
			}
			result[obra].push({ espectaculo: showDateTime, seats, _id, isRelease })
		}
		return result
	}, {})

	// Sort the espectaculos array for each obra by espectaculo
	sortedEspectaculos &&
		Object.values(sortedEspectaculos).forEach((obra) => {
			obra.sort((a, b) => new Date(a.espectaculo) - new Date(b.espectaculo))
		})

	const isPast = (date) => {
		return date < new Date()
	}

	if (Object.keys(sortedEspectaculos).length === 0) {
		return <p className="text-center">No hay Espectáculos disponibles</p>
	}
	return (
		<>
			{obras?.map((obra, index) => {
				return (
					sortedEspectaculos &&
					sortedEspectaculos[obra._id] && (
						<div key={index} className="flex items-center">
							{showObraDetail && <img src={obra.img} className="w-32 px-4 drop-shadow-md" />}
							<div className="mr-4 flex flex-col gap-2 pb-4 pt-2">
								{showObraDetail && (
									<div>
										<h4 className="text-2xl font-semibold">{obra.name}</h4>
										<p className="text-md font-medium">duración : {obra.length || '-'} min</p>
									</div>
								)}
								<div className="flex flex-wrap items-center gap-2 pt-1">
									{sortedEspectaculos[obra._id]?.map((espectaculo, index) => {
										return (
											<button
												key={index}
												title={`${new Date(espectaculo.espectaculo)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(espectaculo.espectaculo)
													.getMinutes()
													.toString()
													.padStart(2, '0')} - ${new Date(
													new Date(espectaculo.espectaculo).getTime() + obra.length * 60000
												)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(
													new Date(espectaculo.espectaculo).getTime() + obra.length * 60000
												)
													.getMinutes()
													.toString()
													.padStart(2, '0')}
														`}
												className={
													isPast(new Date(espectaculo.espectaculo))
														? `flex items-center gap-1 rounded-md bg-gradient-to-br from-gray-100 to-white px-2 py-1 text-lg text-gray-900 ring-1 ring-inset ring-gray-800 drop-shadow-sm ${
																auth.role !== 'admin' && 'cursor-not-allowed'
														  } ${
																auth.role === 'admin' &&
																'to-gray-100 hover:from-gray-200'
														  }`
														: new Date(espectaculo.espectaculo).getTime() ===
														  new Date(
																sortedEspectaculos[obra._id].find(
																	(s) => new Date(s.espectaculo) > new Date()
																).espectaculo
														  ).getTime()
														? 'flex items-center gap-1 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 px-2 py-1 text-lg text-white drop-shadow-sm hover:from-indigo-500 hover:to-blue-400'
														: 'flex items-center gap-1 rounded-md bg-gradient-to-br from-gray-600 to-gray-500 px-2 py-1 text-lg text-white drop-shadow-sm hover:from-gray-500 hover:to-gray-400'
												}
												onClick={() => {
													if (!isPast(new Date(espectaculo.espectaculo)) || auth.role === 'admin')
														return navigate(`/espectaculo/${espectaculo._id}`)
												}}
											>
												{!espectaculo.isRelease && (
													<EyeSlashIcon className="h-6 w-6" title="Reestrenar espectaculo" />
												)}
												{`${new Date(espectaculo.espectaculo)
													.getHours()
													.toString()
													.padStart(2, '0')} : ${new Date(espectaculo.espectaculo)
													.getMinutes()
													.toString()
													.padStart(2, '0')}`}
											</button>
										)
									})}
								</div>
							</div>
						</div>
					)
				)
			})}
		</>
	)
}

export default Espectaculos
