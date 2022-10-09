import { useState, useEffect, useRef } from "react";
import './index.css';

//sample code for testing

const App = () => {

  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const allMessages: string[] = [];
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const submit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (message.length === 0) {
      return;
    }
    const msg = '---CMD---  ' + message;
    allMessages.push(msg);
    setMessages((allMessages) => [...allMessages, msg]);
    window.electron.ipcRenderer.sendMessage('ipc-example', [message]);
  };


  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-example',(args)=>{
      const reply_msg = '--REPLY--  ' + args;
      console.log(reply_msg);
      allMessages.push(reply_msg);
      setMessages((allMessages)=>[...allMessages, reply_msg]);
    });

  }, []);

  useEffect(() => {
    setMessage("");
  }, [messages]);

  // useEffect(() => {
  //   inputRef.current.focus();
  // }, []);

  return (
    <div className="App">
      <div className="chat-window">
        <ul className="messages">
          {messages.map((message, index) => (
            <li className="my-message" key={index}>
              <span>{message}</span>
            </li>
          ))}
        </ul>
        <form className="chat-form" onSubmit={submit}>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              ref={inputRef}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export default App;


