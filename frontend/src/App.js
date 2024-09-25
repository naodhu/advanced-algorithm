// src/App.js
import React from 'react';
import './App.css';
import SortingVisualizer from './components/SortingVisualizer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive Sorting Playground with D3</h1>
      </header>
      <SortingVisualizer />
    </div>
  );
}

export default App;
