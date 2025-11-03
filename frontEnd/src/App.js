import './App.css';
import Map from './components/map.js';
import StatBar from './components/statusBar.js';
import { UserProvider } from './components/ContextUser.js';
import { useEffect, useState } from 'react';

function App() {
  const [addMargin, setAddMargin] = useState(false);

  useEffect(() => {
    // Example: Add bottom margin if height < 700px
    const handleResize = () => {
      setAddMargin(window.innerHeight < 700);
    };

    handleResize(); // run once at start
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('http://localhost:8081/cars')
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.log('Error fetching cars:', err));
  }, []);

  return (
    <UserProvider>
      <div style={{ backgroundColor: '#353535ff', overflow: 'hidden', marginTop: '0vh', height: '100vh' }}>
        <div className="App">
          <div
            style={{
              height: '5vh',
              width: '91%',
              zIndex: 1000,
              marginLeft: '5%',
              marginTop: '5%',
              marginBottom: addMargin ? '10%' : '0%',
              transition: 'margin-bottom 0.3s ease'
            }}
          >
            <StatBar />
          </div>

          <div style={{ marginTop: '3%', zIndex: 1 }}>
            <Map />
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
