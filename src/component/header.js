import React from 'react';
import { getBtnData } from '../api/Api';
import { GlobalContext } from '../GlobalContext';
import { Link } from 'react-router-dom';
import '../assets/styles/header.css';

function Header() {
  const global = React.useContext(GlobalContext);
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
    fetchData();
  }, []);
  return (
    <header className="main_header">
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
