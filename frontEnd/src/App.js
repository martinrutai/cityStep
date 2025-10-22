import './App.css';
import Map from './components/map.js';
import StatBar from './components/statusBar.js';
import { UserProvider } from './components/ContextUser.js';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    fetch('http://localhost:8081/cars')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log('Error fetching cars:', err));
  }, []);
  return (
    <UserProvider>
      <body style={{backgroundColor: '#353535ff', overflow: 'hidden', marginTop: '0vh'}}>
        <div className="App">
            <div style={{height: '5vh', width: '91%', margin: '5%'}}>
              <StatBar />
            </div>
          <div style={{marginTop: '1%'}}>
            <Map />
          </div>
        </div>
      </body>
    </UserProvider>
  );
}

export default App;