import { ArrowsRightLeftIcon, ArrowsUpDownIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline'
import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { AuthContext } from '../context/AuthContext'

const CronogramaTable = ({ teatro, selectedDate }) => {
	const ref = useRef(null)
	const { auth } = useContext(AuthContext)
	const { events } = useDraggable(ref)
	const navigate = useNavigate()

	const getRowStart = (espectaculo) => {
		espectaculo = new Date(espectaculo)
		const hour = espectaculo.getHours()
		const min = espectaculo.getMinutes()
		console.log(hour, min, Math.round((60 * hour + min) / 5))
		return Math.round((60 * hour + min) / 5)
	}

	const getRowSpan = (length) => {
		return Math.round(length / 5)
	}

	const getRowStartRange = () => {
		let firstRowStart = 100000
		let lastRowEnd = 0
		let count = 0
		teatro.salas.forEach((sala, index) => {
			sala.espectaculos.forEach((espectaculo, index) => {
				if (
					new Date(espectaculo.espectaculo).getDate() === selectedDate.getDate() &&
					new Date(espectaculo.espectaculo).getMonth() === selectedDate.getMonth() &&
					new Date(espectaculo.espectaculo).getYear() === selectedDate.getYear()
				) {
					const rowStart = getRowStart(espectaculo.espectaculo)
					if (rowStart < firstRowStart) {
						firstRowStart = rowStart
					}
					if (rowStart + getRowSpan(espectaculo.obra.length) > lastRowEnd) {
						lastRowEnd = rowStart + getRowSpan(espectaculo.obra.length)
					}
					count++
				}
			})
		})
		return [firstRowStart, lastRowEnd, count]
	}

	const getTodayEspectaculos = (sala) => {
		return sala.espectaculos?.filter((espectaculo, index) => {
			return (
				new Date(espectaculo.espectaculo).getDate() === selectedDate.getDate() &&
				new Date(espectaculo.espectaculo).getMonth() === selectedDate.getMonth() &&
				new Date(espectaculo.espectaculo).getYear() === selectedDate.getYear()
			)
		})
	}

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // Convierte el carácter a ASCII y lo ajústa al índice basado en 1
			result = result * 26 + charCode
		}
		return result
	}

	const firstRowStart = getRowStartRange()[0]
	const gridRows = Math.max(1, getRowStartRange()[1] - getRowStartRange()[0])
	const espectaculoCount = getRowStartRange()[2]
	const shiftStart = 3
	const shiftEnd = 2

	const isPast = (date) => {
		return date < new Date()
	}

	return (
		<>
			<div
				className={`grid min-h-[50vh] max-h-screen overflow-x-auto grid-cols-${teatro.salas?.length.toString()} grid-rows-${
					gridRows + shiftEnd
				} rounded-md bg-gradient-to-br from-indigo-100 to-white`}
				{...events}
				ref={ref}
			>
				{teatro.salas?.map((sala, index) => {
					{
						return getTodayEspectaculos(sala)?.map((espectaculo, index) => {
							return (
								<button
									title={`${espectaculo.obra.name}\n${new Date(espectaculo.espectaculo)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(espectaculo.espectaculo)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(espectaculo.espectaculo).getTime() + espectaculo.obra.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(espectaculo.espectaculo).getTime() + espectaculo.obra.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}
												`}
									key={index}
									className={`flex flex-col items-center overflow-y-scroll row-span-${getRowSpan(
										espectaculo.obra.length
									)} row-start-${
										getRowStart(espectaculo.espectaculo) - firstRowStart + shiftStart
									} col-start-${sala.number} mx-1 rounded p-1 text-center drop-shadow-md ${
										!isPast(new Date(espectaculo.espectaculo))
											? 'bg-white hover:bg-gray-100'
											: `bg-gray-200  ${
													auth.role === 'admin' ? 'hover:bg-gray-300' : 'cursor-not-allowed'
											  }`
									} ${!espectaculo.isRelease && 'ring-2 ring-inset ring-gray-800'}`}
									onClick={() => {
										if (!isPast(new Date(espectaculo.espectaculo)) || auth.role === 'admin')
											return navigate(`/espectaculo/${espectaculo._id}`)
									}}
								>
									{!espectaculo.isRelease && (
										<EyeSlashIcon
											className="mx-auto h-5 w-5 stroke-2"
											title="Unreleased espectaculo"
										/>
									)}
									<p className="text-sm font-bold">{espectaculo.obra.name}</p>
									<p className="text-sm leading-3">{`${new Date(espectaculo.espectaculo)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(espectaculo.espectaculo)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(espectaculo.espectaculo).getTime() + espectaculo.obra.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(espectaculo.espectaculo).getTime() + espectaculo.obra.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}`}</p>
								</button>
							)
						})
					}
				})}

				{espectaculoCount === 0 && (
					<div className="col-span-full row-start-3 flex items-center justify-center text-xl font-semibold text-gray-700">
						No hay espectáculos disponibles
					</div>
				)}

				{teatro.salas.map((sala, index) => (
					<div
						key={index}
						className="sticky top-0 row-span-1 row-start-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 py-1 text-white"
					>
						<p className="text-2xl font-semibold leading-7">{index + 1}</p>
						{auth.role === 'admin' && (
							<>
								<div className="flex gap-1 text-xs">
									<p className="flex items-center gap-1">
										<ArrowsUpDownIcon className="h-3 w-3" />
										{sala.seatPlan.row === 'A'
											? sala.seatPlan.row
											: `A - ${sala.seatPlan.row}`}
									</p>
									<p className="flex items-center gap-1">
										<ArrowsRightLeftIcon className="h-3 w-3" />
										{sala.seatPlan.column === 1
											? sala.seatPlan.column
											: `1 - ${sala.seatPlan.column}`}
									</p>
								</div>
								<p className="flex items-center gap-1 text-sm">
									<UserIcon className="h-4 w-4" />
									{(rowToNumber(sala.seatPlan.row) * sala.seatPlan.column).toLocaleString(
										'en-US'
									)}{' '}
									Butacas
								</p>
							</>
						)}
					</div>
				))}
			</div>
		</>
	)
}

export default CronogramaTable
