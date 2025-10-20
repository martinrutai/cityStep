import './App.css';
import Map from './components/map.js';
import StatBar from './components/statusBar.js';
import { UserProvider } from './components/ContextUser.js';

function App() {
  return (
    <UserProvider>
      <body style={{backgroundColor: '#353535ff', overflow: 'hidden', marginTop: '7vh'}}>
        <div className="App">
            <div style={{height: '5vh', width: '91%', margin: '5%'}}>
              <StatBar />
            </div>
          <div style={{marginTop: '2%'}}>
            <Map />
          </div>
        </div>
      </body>
    </UserProvider>
  );
}

export default App;