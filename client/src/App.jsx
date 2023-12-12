import axios from 'axios'
import { Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import AdminRoute from './AdminRoute'
import Teatro from './pages/Teatro.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Obra from './pages/Obra.jsx'
import Compra from './pages/Compra.jsx'
import Register from './pages/Register'
import Cronograma from './pages/Cronograma.jsx'
import Search from './pages/Search'
import Espectaculo from './pages/Espectaculo.jsx'
import Tickets from './pages/Tickets'
import User from './pages/User'
import PaymentForms from './pages/PaymentForms.jsx'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'
axios.defaults.withCredentials = true

function App() {
	return (
		<>
			<ToastContainer />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/teatro" element={<Teatro />} />
				<Route path="/pagos" element={<PaymentForms />} />
				<Route
					path="/obra"
					element={
						<AdminRoute>
							<Obra />
						</AdminRoute>
					}
				/>
				<Route
					path="/search"
					element={
						<AdminRoute>
							<Search />
						</AdminRoute>
					}
				/>
				<Route path="/espectaculo/:id" element={<Espectaculo />} />
				<Route path="/compra/:id" element={<Compra />} />
				<Route path="/ticket" element={<Tickets />} />
				<Route path="/cronograma" element={<Cronograma />} />
				<Route
					path="/user"
					element={
						<AdminRoute>
							<User />
						</AdminRoute>
					}
				/>
			</Routes>
		</>
	)
}

export default App
