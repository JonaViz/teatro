import axios from 'axios'
import { createContext, useEffect, useState } from 'react'

const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
	const [auth, setAuth] = useState(
		JSON.parse(localStorage.getItem('auth')) || {
			username: null,
			email: null,
			role: null,
			token: null
		}
	) //{username, email, role, token}

	const getUser = async () => {
		try {
			if (!auth.token) return;
			const response = await axios.get('/auth/me', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			});
	
			const updatedAuth = {
				...auth,
				username: response.data.data.username,
				email: response.data.data.email,
				role: response.data.data.role
			};
	
			setAuth(prevAuth => {
				if (
					updatedAuth.username !== prevAuth.username ||
					updatedAuth.email !== prevAuth.email ||
					updatedAuth.role !== prevAuth.role
				) {
					return updatedAuth;
				} else {
					return prevAuth; // No hay cambios, devuelve el estado anterior
				}
			});
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getUser(); // Llamar a getUser para obtener los datos del usuario
	
		// Guardar el estado actualizado en el almacenamiento local
		localStorage.setItem('auth', JSON.stringify(auth));
	}, [auth]); 

	return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthContextProvider }
