import './App.css';
import Map from './components/map.js';
import StatBar from './components/statusBar.js';
import Profile from './components/profile.js';
import { UserProvider } from './components/ContextUser.js';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [addMargin, setAddMargin] = useState(false);
  const [topMargin, setTopMargin] = useState(window.innerWidth > 550 ? '0vh' : '12vh');
  const [statusBarMargin, setStatusBarMargin] = useState(window.innerWidth > 550 ? '0%' : '0%');

  useEffect(() => {
    const handleResize = () => {
      setAddMargin(window.innerHeight < 700);
      setTopMargin(window.innerWidth > 550 ? '5vh' : '2vh');
      setStatusBarMargin(window.innerWidth > 550 ? '2%' : '5%');
    };

    handleResize(); 
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div style={{ backgroundColor: '#353535ff', overflow: 'hidden', marginTop: '0vh', height: '100vh' }}>
                <div className="App">
                  <div
                    style={{
                      height: '5vh',
                      width: '91%',
                      zIndex: 1000,
                      marginLeft: '5%',
                      marginTop: statusBarMargin,
                      marginBottom: addMargin ? '10%' : '0%',
                      transition: 'margin-bottom 0.3s ease'
                    }}
                  >
                    <StatBar />
                  </div>

                  <div style={{ marginTop: topMargin, zIndex: 1 }}>
                    <Map />
                  </div>
                </div>
              </div>
            }
          />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
