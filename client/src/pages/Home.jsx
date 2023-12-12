import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '../components/Navbar'
import NowShowing from '../components/NowShowing'
import SalaListsByObra from '../components/SalaListsByObra.jsx'
import { AuthContext } from '../context/AuthContext'

const Home = () => {
	const { auth } = useContext(AuthContext)
	const [selectedObraIndex, setSelectedObraIndex] = useState(parseInt(sessionStorage.getItem('selectedObraIndex')))
	const [obras, setObras] = useState([])
	const [isFetchingObrasDone, setIsFetchingObrasDone] = useState(false)

	const fetchObras = async (data) => {
		try {
			setIsFetchingObrasDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/obra/unreleased/showing', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/obra/showing')
			}
			// console.log(response.data.data)
			setObras(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingObrasDone(true)
		}
	}

	useEffect(() => {
		fetchObras()
	}, [])

	const props = {
		obras,
		selectedObraIndex,
		setSelectedObraIndex,
		auth,
		isFetchingObrasDone
	}
	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8">
			<Navbar />
			<NowShowing {...props} />
			{obras[selectedObraIndex]?.name && <SalaListsByObra {...props} />}
		</div>
	)
}

export default Home
