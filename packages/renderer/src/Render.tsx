/* eslint-disable @typescript-eslint/ban-ts-comment */
import React,
    { useState,
      useRef,
      useEffect,
      useMemo }               from 'react';
import styled                 from 'styled-components';
import { MultiCheckBoxColumnFilter
  , Table }                   from './components/Table-server';
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
    overflow-y: hidden;
    overflow-x: hidden;
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
      // position: relative;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
      .resizer {
        display: inline-block;
        background: black;
        width: 10px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
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
  const [cmdList, setCmdList] = useState<string[]>([]);
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;



  const submit = (e: {preventDefault: () => void}) => {
    // setSubmitCmd(1);
    e.preventDefault();
    setCmdList([...cmdList, message]);
    if (message.length === 0) {
      return;
    }
    if (message == 'clear') {
      setMessages([]);
    }
    else {
      // const msg = makeCmd(message);
      setMessage('');
      // allMessages.push(msg);
      // setMessages(allMessages => [...allMessages, msg]);
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
        width:40,
      },
      {
        Header: 'Mod',
        accessor: 'mod',
        Filter: MultiCheckBoxColumnFilter,
        filter: 'multiSelect',
        width: 30,
      },
      {
        Header: 'Ct',
        accessor: 'ct',
        disableFilters: true,
        width: 10,
      },
      {
        Header: 'Terminal Data',
        accessor: 'terminal',
        disableFilters: true,
        width: 250,
      },
    ],
    [],
  );

  function ipcReceive(){
    window.electron.ipcRenderer.on('ipc-msg', args => {
      // console.log(typeof(args));
      // console.log(args);
      setMessages(args as cmdMessage[]);
    });

  }

  useEffect(() => {
    ipcReceive();
  }, []);

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
