import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';



window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);

  ReactDOM.render(
    <React.StrictMode>
      <App message={arg as string}/>
    </React.StrictMode>,
    document.getElementById('app')
  );
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);

