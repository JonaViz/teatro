import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();
  const [errorsMessage, setErrorsMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const onFinish = async (values) => {
    setIsRegistering(true);
    try {
      const response = await axios.post('/auth/register', values);
      // console.log(response.data);
      notification.success({
        message: 'Registration successful!',
        placement: 'topCenter',
        duration: 2,
      });
      navigate('/login');
    } catch (error) {
      console.error(error.response.data);
      setErrorsMessage(error.response.data);
      notification.error({
        message: 'Error',
        placement: 'topCenter',
        duration: 2,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const inputClasses = () => {
    return 'appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">Registro</h2>
        </div>
        <Form name="register" onFinish={onFinish} className="mt-8 space-y-4">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              {
                min: 6,
                message: 'Password must be at least 6 characters long!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            {errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isRegistering}
              disabled={isRegistering}
            >
              {isRegistering ? 'Processing...' : 'Register'}
            </Button>
          </Form.Item>
          <p className="text-right">
            Already have an account?{' '}
            <Link to={'/login'} className="font-bold text-blue-600">
              Login here
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Register;
