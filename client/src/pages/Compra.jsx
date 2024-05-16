import { TicketIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import EspecaculoDetails from '../components/EspecaculoDetails.jsx'
import { AuthContext } from '../context/AuthContext'


const Compra = () => {
	const navigate = useNavigate()
	const { auth } = useContext(AuthContext)
	const location = useLocation()
	const espectaculo = location.state.espectaculo
	const selectedSeats = location.state.selectedSeats || []
	const [isPurchasing, SetIsPurchasing] = useState(false)

	const onCompra = async (data) => {
		SetIsPurchasing(true)
		try {
			const response = await axios.post(
				`/espectaculo/${espectaculo._id}`,
				{ seats: selectedSeats },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			//navigate('/teatro')
			navigate('/pagos')
			toast.success('Reserva de butacas correcta!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(error.response.data.message || 'Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsPurchasing(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8">
			<Navbar />
			<div className="mx-4 h-fit rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<EspecaculoDetails espectaculo={espectaculo} />
				<div className="flex flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row">
					<div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
						<p className="font-semibold"> Butacas seleccionadas : </p>
						<p className="text-start">{selectedSeats.join(', ')}</p>
						{!!selectedSeats.length && <p className="whitespace-nowrap">({selectedSeats.length} butacas)</p>}
						
					</div>
					

					{!!selectedSeats.length && (
						<button
							onClick={() => onCompra()}
							className="flex items-center justify-center gap-2 rounded-b-lg  bg-gradient-to-br from-indigo-600 to-blue-500 px-4 py-1 font-semibold text-white hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg"
							disabled={isPurchasing}
						>
							{isPurchasing ? (
								'Processing...'
							) : (
								<>
									<p>Confirmar Compra</p>
									<TicketIcon className="h-7 w-7 text-white" />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default Compra
