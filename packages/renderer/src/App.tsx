import {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {Table} from './components/Table';
import './index.css';
const Styles = styled.div`
  ${
    '' /* These styles are suggested for the table fill all available space in its containing element */
  }
  display: block;
  ${'' /* These styles are required for a horizontaly scrollable table overflow */}
  overflow: auto;
  body {
    margin: 0;
  }
  .main {
    left: 0;
    right: 0;
    height: 100vh;
    background-color: black;
    // text-align: center;
  }
  .table {
    border-spacing: 0;
    background-color: black;
    color: white;
    height: 95vh;
    border-spacing: 0;
    /* border: 1px solid black; */
    .thead {
      ${'' /* These styles are required for a scrollable body to align with the header properly */}
      overflow-y: hidden;
      overflow-x: hidden;
    }

    .tbody {
      height: 90vh;
      ${'' /* These styles are required for a scrollable table body */}
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
      /* border-bottom: 1px solid black; */
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      /* border-right: 1px solid black; */
      :last-child {
        border-right: 0;
      }
    }
  }
`;

//sample code for testing

const App = () => {
  type cmdMessage = {
    time: string;
    mod: string;
    ct: number;
    terminal: string;
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<cmdMessage[]>([]);
  const allMessages = [];
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const makeCmd = (cmd: string) => {
    return {
      time: '',
      mod: 'CMD',
      ct: 4,
      terminal: cmd,
    };
  };
  const makeReplyMsg = (msg: string) => {
    return {
      time: '',
      mod: 'REPLY',
      ct: 4,
      terminal: msg,
    };
  };

  const submit = (e: {preventDefault: () => void}) => {
    e.preventDefault();
    if (message.length === 0) {
      return;
    }
    const msg = makeCmd(message);
    setMessage('');
    allMessages.push(msg);
    //    setMessages(allMessages => [...allMessages, msg]);
    setMessages([...messages, msg]);
    window.electron.ipcRenderer.sendMessage('ipc-example', [message]);
  };

  const columns = [
    {
      Header: 'Time',
      accessor: 'time',
    },
    {
      Header: 'Mod',
      accessor: 'mod',
    },
    {
      Header: 'Ct',
      accessor: 'ct',
    },
    {
      Header: 'Terminal Data',
      accessor: 'terminal',
    },
  ];

  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-example', args => {
      const reply_msg = makeReplyMsg(args as string);
      allMessages.push(reply_msg);
      setMessages(allMessages => [...allMessages, reply_msg]);
    });
  }, []);

  useEffect(() => {
    setMessage('');
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [message === 'clear']);

  return (
    <Styles>
      <div className="main">
        <div className="chat-window">
          <Table
            columns={columns}
            data={messages}
          />

          <form
            className="chat-form"
            onSubmit={submit}
          >
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                ref={inputRef}
              />
            </div>
          </form>
        </div>
      </div>
    </Styles>
  );
};
export default App;
