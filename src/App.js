import logo from './logo.svg';
import './App.css';
import solveCaptcha from './solveCaptcha';
import AuthHandler from './refreshAuth';
import VacancyEmitter from './vacancyEmitter';
// (new AuthHandler('9406531900','https://smee.io/J9FRgF24AbDv82pg')).start();
// let vacancy = new VacancyEmitter()
// vacancy.on('event',console.log);
// vacancy.start();


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
