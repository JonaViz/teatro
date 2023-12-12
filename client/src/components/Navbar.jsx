import React, { useContext, useState } from 'react';
import { Layout, Menu, Button, notification, Affix } from 'antd';
import {
  ClockCircleOutlined,
  HomeOutlined,
  SearchOutlined,
  UserOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

const { Header } = Layout;

const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await axios.get('/auth/logout');
      setAuth({ username: null, email: null, role: null, token: null });
      sessionStorage.clear();
      navigate('/');
      notification.success({
        message: 'Logout successful!',
        placement: 'topCenter',
        duration: 2,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        placement: 'topCenter',
        duration: 2,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuLists = () => {
    return (
      <Menu mode="horizontal" theme="dark">
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to={'/teatro'}>Teatro</Link>
        </Menu.Item>
        <Menu.Item key="cronograma" icon={<ClockCircleOutlined />}>
          <Link to={'/cronograma'}>Cronograma</Link>
        </Menu.Item>
        {auth.role && (
          <Menu.Item key="ticket" icon={<AppstoreOutlined />}>
            <Link to={'/ticket'}>Ticket</Link>
          </Menu.Item>
        )}
        {auth.role === 'admin' && (
          <>
            <Menu.Item key="obra" icon={<VideoCameraOutlined />}>
              <Link to={'/obra'}>Obra</Link>
            </Menu.Item>
            <Menu.Item key="search" icon={<SearchOutlined />}>
              <Link to={'/search'}>Buscar</Link>
            </Menu.Item>
            <Menu.Item key="user" icon={<UserOutlined />}>
              <Link to={'/user'}>Usuarios</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    );
  };

  return (
    <Affix offsetTop={0}>
      <Header>
        <div className="logo" />
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button type="text" className="text-white" icon={<HomeOutlined />} size="large">
              Home
            </Button>
          </Link>
          {menuLists()}
          <div className="flex items-center gap-3">
            {auth.username && (
              <p className="text-md whitespace-nowrap leading-none text-white">Bienvenido {auth.username}!</p>
            )}
            {auth.token ? (
              <Button type="primary" danger onClick={() => onLogout()} loading={isLoggingOut} disabled={isLoggingOut}>
                {isLoggingOut ? 'Procesando...' : 'Logout'}
              </Button>
            ) : (
              <Button type="primary">
                <Link to={'/login'}>Login</Link>
              </Button>
            )}
          </div>
        </div>
      </Header>
    </Affix>
  );
};

export default Navbar


