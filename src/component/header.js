import React from 'react';
import { getBtnData } from '../api/buttonApi';
import { GlobalContext } from '../GlobalContext';
import './header.css';

function Header() {
  const global = React.useContext(GlobalContext);
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const image = await getBtnData('frontImage');
        console.log('IMAGE    ', image[0].image);
        setUrl(image[0].image);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);
  return (
    <header className="main_header">
      <nav>
        <img src={global.image} alt="google logo" />
      </nav>
    </header>
  );
}

export default Header;
