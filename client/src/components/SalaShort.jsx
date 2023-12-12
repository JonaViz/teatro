import { ArrowsRightLeftIcon, ArrowsUpDownIcon, UserIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import Loading from './Loading'
import Espectaculos from './Espectaculos.jsx'

const SalaShort = ({ salaId, obras, selectedDate, filterObra, rounded = false }) => {
	const { auth } = useContext(AuthContext)
	const [sala, setSala] = useState({})
	const [isFetchingSalaDone, setIsFetchingSalaDone] = useState(false)

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

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // Convierte el carácter a ASCII y lo ajusta al índice basado en 1
			result = result * 26 + charCode
		}
		return result
	}

	if (!isFetchingSalaDone) {
		return <Loading />
	}

	return (
		<div
			className={`flex flex-col bg-gradient-to-br from-indigo-100 to-white sm:flex-row sm:rounded-tr-none ${
				rounded && 'rounded-b-md'
			}`}
		>
			<div className="flex flex-col sm:flex-row">
				<div
					className={`flex min-w-[120px] flex-row items-center justify-center gap-x-2 bg-gradient-to-br from-gray-800 to-gray-700 px-4 py-0.5 text-2xl font-bold text-white sm:flex-col ${
						rounded && 'sm:rounded-bl-md'
					}`}
				>
					<p className="text-sm">Sala</p>
					<p className="text-3xl leading-8">{sala.number}</p>
				</div>
				{auth.role === 'admin' && (
					<div
						className={`flex w-full min-w-[160px] flex-row justify-center gap-x-4 border-b-2 border-indigo-200 bg-gradient-to-br from-indigo-100 to-white px-4 py-0.5 text-sm font-bold sm:w-fit sm:flex-col sm:border-none`}
					>
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
							Butacas
						</div>
					</div>
				)}
			</div>
			<div className="mx-4 flex items-center">
				<Espectaculos
					espectaculos={sala.espectaculos}
					obras={obras}
					selectedDate={selectedDate}
					filterObra={filterObra}
					showObraDetail={false}
				/>
			</div>
		</div>
	)
}
export default SalaShort
