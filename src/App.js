import React from 'react';
import './App.css';
import GetEmail from './components/GetEmail';
import mail2 from './mail2.svg';

function App() {
  return (
      <div className="App">
          <header className="App-header">
              <img src={mail2} className="App-logo" alt="mail1" />
              Email Upload Page
          </header>
          <GetEmail />
      </div>
  );
}


export default App;
