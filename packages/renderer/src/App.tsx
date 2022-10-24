/* eslint-disable @typescript-eslint/ban-ts-comment */
import React,
    { useState,
      useRef,
      useEffect,
      useMemo }               from 'react';
import styled                 from 'styled-components';
import { MultiCheckBoxColumnFilter
  , Table }                   from './components/Table';
import './style/index.css';
import './style/styles.css';
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
      border-bottom: 1px solid black;
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
`;


function Terminal() {
  type cmdMessage = {
    time: string;
    mod: string;
    ct: number;
    terminal: string;
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<cmdMessage[]>([]);
  const allMessages = new Array<cmdMessage>;
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const makeCmd = (cmd: string) => {
    const time = new Date();
    console.log(time.toLocaleString());
    return {
      time: time.toLocaleString(),
      mod: 'CMD',
      ct: 4,
      terminal: cmd,
    };
  };
  const makeReplyMsg = (msg: string) => {
    const time = new Date();
    console.log(time.toLocaleString());
    return {
      time: time.toLocaleString(),
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
    if (message == 'clear') {
      setMessages([]);
    } else {
      const msg = makeCmd(message);
      setMessage('');
      allMessages.push(msg);
      setMessages(allMessages => [...allMessages, msg]);
      // setMessages([...messages, msg]);
      window.electron.ipcRenderer.sendMessage('ipc-cmd', [message]);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Time',
        accessor: 'time',
        disableFilters: true,
        width: 40,
      },
      {
        Header: 'Mod',
        accessor: 'mod',
        Filter: MultiCheckBoxColumnFilter,
        filter: 'multiSelect',
        width: 10,
      },
      {
        Header: 'Ct',
        accessor: 'ct',
        disableFilters: true,
        width: 'auto',
      },
      {
        Header: 'Terminal Data',
        accessor: 'terminal',
        disableFilters: true,
        width: 200,
      },
    ],
    [],
  );

  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-msg', args => {
      const reply_msg = makeReplyMsg(args as string);
      allMessages.push(reply_msg);
      setMessages(allMessages => [...allMessages, reply_msg]);
    });
  }, []);

  useEffect(() => {
    setMessage('');
  }, [messages]);

  return (
    <Styles>
      <div className="main">
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
              placeholder="CMD...."
              value={message}
              onChange={e => setMessage(e.target.value)}
              ref={inputRef}
            />
          </div>
        </form>
      </div>
    </Styles>
  );
}

export default Terminal;
