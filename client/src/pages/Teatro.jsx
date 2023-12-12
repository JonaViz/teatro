import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import TeatroLists from '../components/TeatroLists.jsx'
import Navbar from '../components/Navbar'
import SalaListsByTeatro from '../components/SalaListsByTeatro.jsx'
import { AuthContext } from '../context/AuthContext'

const Teatro = () => {
	const { auth } = useContext(AuthContext)
	const [selectedTeatroIndex, setSelectedTeatroIndex] = useState(
		parseInt(sessionStorage.getItem('selectedTeatroIndex')) || 0
	)
	const [teatros, setTeatros] = useState([])
	const [isFetchingTeatros, setIsFetchingTeatros] = useState(true)

	const fetchTeatros = async (newSelectedTeatro) => {
		try {
			setIsFetchingTeatros(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/teatro/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/teatro')
			}

			// console.log(response.data.data)
			setTeatros(response.data.data)
			if (newSelectedTeatro) {
				response.data.data.map((teatro, index) => {
					if (teatro.name === newSelectedTeatro) {
						setSelectedTeatroIndex(index)
						sessionStorage.setItem('selectedTeatroIndex', index)
					}
				})
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingTeatros(false)
		}
	}

	useEffect(() => {
		fetchTeatros()
	}, [])

	const props = {
		teatros,
		selectedTeatroIndex,
		setSelectedTeatroIndex,
		fetchTeatros,
		auth,
		isFetchingTeatros
	}
	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8">
			<Navbar />
			<TeatroLists {...props} />
			{teatros[selectedTeatroIndex]?.name && <SalaListsByTeatro {...props} />}
		</div>
	)
}

export default Teatro
