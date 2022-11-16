import App from './App';
import Render from './Render';
import {createRoot} from 'react-dom/client';

const container = document.getElementById('app');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<Render />);

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
