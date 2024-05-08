import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import '../../node_modules/antd/dist/reset.css';
import Cards from 'react-credit-cards-2';
import  '../../node_modules/react-credit-cards-2/dist/es/styles-compiled.css'


const PaymentForm = () => {
    const navigate = useNavigate()
    const [state, setState] = useState({
        number: '',
        name: '',
        cvc: '',
        expiry: '',
        focus: ''
    })
	
    const handleFocus = (e) => {
        setState({ 
            ...state,
            focus: e.target.name 
        });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState({ 
            ...state,
            [name]: value 
        });
    }

    const submitPayment = () => {
        console.log("name => " , state.name)
        console.log("number => " , state.number)
        console.log("expiry => " , state.expiry)
        console.log("cvc => " , state.cvc)
        navigate('/teatro')
        toast.success('Pago realizado con exito!', {
            position: 'top-center',
            autoClose: 2000,
            pauseOnHover: false
        })


      //  alert(JSON.stringify(state))
    }

    return (

<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">PAGOS</h2>
        </div>
        <div className="centrar-contenido">
            <div className="card">
                <div className="card-body">
                    <Cards
                        cvc={state.cvc}
                        expiry={state.expiry}
                        focused={state.focus}
                        name={state.name}
                        number={state.number}
                    />
                    <br />
                    <form>
                        <div className="form-group">
                            <label htmlFor="number">Número de la tarjeta</label>
                            <input
                                type="text"
                                className="form-control"
                                name="number"
                                maxLength="16"
                                placeholder="Número de tarjeta"
                                onChange={handleChange}
                                onFocus={handleFocus}
                                style={{ textAlign: 'center' }}
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label htmlFor="Nombre">Nombre</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                maxLength="30"
                                placeholder="Nombre"
                                onChange={handleChange}
                                onFocus={handleFocus}
                                style={{ textAlign: 'center' }}
                            />
                        </div>
                        <br />
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label htmlFor="expiry">Vencimiento</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="expiry"
                                    maxLength="4"
                                    placeholder="Expiración"
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    style={{ textAlign: 'center' }}
                                />
                            </div>
                            <br />
                            <div className="form-group col-md-6">
                                <label htmlFor="cvc">CVC</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="cvc"
                                    maxLength="4"
                                    placeholder="CVC"
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    style={{ textAlign: 'center' }}
                                />
                            </div>
                        </div>
                        <br />
                        <button
                            type="button"
                            className="flex w-fit items-center gap-1 mx-auto block rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 py-2 px-4 text-lg font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
                            onClick={submitPayment} style={{ textAlign: 'center' }}
                        >Pagar</button>
                    </form>
                </div>
            </div>
        </div>
        </div>
        </div>
    );
}


export default PaymentForm