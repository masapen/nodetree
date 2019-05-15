import React from 'react';
import './App.scss';

import TreeComponent from 'components/Tree';

function App() {
  return (
    <div className="App centered">
      <header className="App-header dressing">
          Header Name
      </header>
      <div className="main">
        <TreeComponent />
      </div>
      <footer className="credits dressing centered">
      Footer Name
      Made by Mykel Pendergrass
      </footer>
    </div>
  );
}

export default App;
