import React, { useState } from 'react';
import './App.css';
import DirectorySelect from './DirectorySelect';
import DirectoryList from './DirectoryList';

function App() {

  const [directory, setDirectory] = useState('');
  const [directoryList, setDirectoryList] = useState([]);

    return (
      <div className="App">
        <div>Working with Directory {directory}</div>
        <DirectorySelect directory={directory} setDirectory={setDirectory} directoryList={directoryList} setDirectoryList={setDirectoryList} />
        <DirectoryList directory={directory} setDirectory={setDirectory} directoryList={directoryList} setDirectoryList={setDirectoryList} />
      </div>
    );
  }


export default App;
