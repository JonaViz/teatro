import React, { useContext, useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const onFinish = async (values) => {
    setIsLoggingIn(true);
    try {
      const response = await axios.post('/auth/login', values);
      // console.log(response.data);
      notification.success({
        message: 'Login successful!',
        placement: 'topCenter',
        duration: 2,
      });
      setAuth((prev) => ({ ...prev, token: response.data.token }));
      navigate('/');
    } catch (error) {
      console.error(error.response.data);
      notification.error({
        message: 'Error',
        placement: 'topCenter',
        duration: 2,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">Login</h2>
        </div>
        <Form name="login" onFinish={onFinish} className="mt-8 space-y-4">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Processing...' : 'Login'}
            </Button>
          </Form.Item>
          <p className="text-right">
            Don’t have an account?{' '}
            <Link to={'/register'} className="font-bold text-blue-600">
              Register here
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Login
