import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import EspecaculoDetails from '../components/EspecaculoDetails.jsx'
import { AuthContext } from '../context/AuthContext'

const Tickets = () => {
	const { auth } = useContext(AuthContext)
	const [tickets, setTickets] = useState([])
	const [isFetchingticketsDone, setIsFetchingticketsDone] = useState(false)
	const fetchTickets = async () => {
		try {
			setIsFetchingticketsDone(false)
			const response = await axios.get('/auth/tickets', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			setTickets(
				response.data.data.tickets?.sort((a, b) => {
					if (a.espectaculo.espectaculo > b.espectaculo.espectaculo) {
						return 1
					}
					return -1
				})
			)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingticketsDone(true)
		}
	}

	useEffect(() => {
		fetchTickets()
	}, [])

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Mis Entradas</h2>
				{isFetchingticketsDone ? (
					<>
						{tickets.length === 0 ? (
							<p className="text-center">Aún no has comprado ninguna entrada</p>
						) : (
							<div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3">
								{tickets.map((ticket, index) => {
									return (
										<div className="flex flex-col" key={index}>
											<EspecaculoDetails espectaculo={ticket.espectaculo} />
											<div className="flex h-full flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row">
												<div className="flex h-full flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
													<p className="whitespace-nowrap font-semibold">Butacas : </p>
													<p className="text-left">
														{ticket.seats.map((seat) => seat.row + seat.number).join(', ')}
													</p>
													<p className="whitespace-nowrap">({ticket.seats.length} butacas)</p>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</>
				) : (
					<Loading />
				)}
			</div>
		</div>
	)
}

export default Tickets
