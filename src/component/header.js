import React from 'react';
import { getBtnData } from '../api/Api';
import { GlobalContext } from '../GlobalContext';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import '../assets/styles/header.css';

function Header() {
  const global = React.useContext(GlobalContext);
  const location = useLocation();
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const image = await getBtnData('frontImage');
        global.setImage(image[0].image);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    if (localStorage.hasOwnProperty('isToten')) {
      const toten = JSON.parse(localStorage.getItem('isToten'));
      if (toten) global.setIsToten(true);
    }
    fetchData();
  }, []);

  const headerClass = `main_header 
  ${global.isToten ? 'toten' : ''} 
  ${
    location.pathname.includes('/orderqueue') ||
    location.pathname.includes('/create-customer')
      ? 'orderqueue'
      : ''
  }`.trim();

  return (
    <header className={headerClass}>
      <nav>
        <Link to="/">
          {' '}
          <img src={global.image} alt="google logo" />
        </Link>
      </nav>
    </header>
  );
}

export default Header;
