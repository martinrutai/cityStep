import logo from './logo.svg';
import './App.css';
import Map from './components/map.js';
import StatBar from './components/statusBar.js';

function App() {
  return (
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
  );
}

export default App;