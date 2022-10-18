import App from './App';
import {createRoot} from 'react-dom/client';

const container = document.getElementById('app');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);

// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
// window.electron.ipcRenderer.on('ipc-example',(arg)=>{
//   console.log(arg);
// });
// ReactDOM.render(
//   <React.StrictMode>
//     {/* <App message={arg as string}/> */}
//     <App />
//     {/* <Album /> */}
//   </React.StrictMode>,
//   document.getElementById('app'),
// );
