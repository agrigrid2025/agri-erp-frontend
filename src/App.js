import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/test/`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(data => setMessage(data))
      .catch(err => setMessage('Error: ' + err.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Django Test</h1>
        <p>Response from Django: <strong>{message}</strong></p>
      </header>
    </div>
  );
}

export default App;