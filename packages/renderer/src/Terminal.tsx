/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {useState, useRef, useEffect} from 'react';
import styled from 'styled-components';
import type { Row, FilterProps } from 'react-table';
import {useTable, useFlexLayout, useFilters, useSortBy, useGlobalFilter} from 'react-table';
import './index.css';
import './styles.css';
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

type terminalData = {
  time: string;
  mod: string;
  ct: number;
  terminal: string;
}

// Define a default UI for filtering
function DefaultColumnFilter({column: {filterValue, preFilteredRows, setFilter}}:FilterProps<terminalData>) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

function MultiCheckBoxColumnFilter({column: {setFilter, preFilteredRows, id}}:FilterProps<terminalData>) {
  const options = React.useMemo(() => {
    const counts = {} as {[key:string]:number};
    preFilteredRows.forEach((Row : Row<terminalData>) => {
      const x = Row.values[id].toString();
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }, [id, preFilteredRows]);

  const [checked, setChecked] = React.useState(Object.keys(options));
  // const [checked, setChecked] = React.useState([]);
  //我们事先将所有选项放进checked中并setFilter 此时我们全选了，
  //通过监听checkbox事件变化我们得到checkbox的name 从而更新我们的checked和setFilter
  const onChange = (e: { target: { name: { toString: () => any; }; }; }) => {
    const t = e.target.name.toString();
    if (checked && checked.includes(t)) {
      setChecked(prevChecked => {
        if (prevChecked.length === 1) return Object.keys(options);
        setFilter(prevChecked.filter(v => v !== t));
        return prevChecked.filter(v => v !== t);
      });
    } else {
      setFilter([...checked, t]);
      setChecked(prevChecked => [...prevChecked, t]);
    }
  };

  const handleCheckAll = () => {
    setChecked(Object.keys(options));
    setFilter([]);
  };
  const handleCheckNone = () => {
    setChecked([]);
    setFilter([]);
  };

  let expanded = false;

  function showCheckboxes() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const checkboxes = document.getElementById('checkboxes')!;
    if (!expanded) {
      checkboxes.style.display = 'block';
      expanded = true;
    } else {
      checkboxes.style.display = 'none';
      expanded = false;
    }
  }

  return (
    <div>
      <div className="multiselect">
        <div
          className="selectBox"
          onClick={showCheckboxes}
        >
          MOD
          <div className="overSelect"></div>
        </div>
        <div id="checkboxes">
          <div
            style={{cursor: 'pointer'}}
            onClick={handleCheckAll}
          >
            Check All
          </div>
          <div
            style={{cursor: 'pointer'}}
            onClick={handleCheckNone}
          >
            Check NONE
          </div>
          {Object.entries(options).map(([option, count], i) => {
            return (
              <label
                key={i}
                htmlFor={option}
              >
                <input
                  type="checkbox"
                  color="primary"
                  name={option}
                  id={option}
                  checked={checked.includes(option)}
                  onChange={onChange}
                  title={`${option} (${count})`}
                />
                {option}({count})

              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
type cmdMessage = {
  time: number;
  mod: string;
  ct: number;
  terminal: string;
};

interface inputTable  {
  // columns: Array<Column<object>>;
  columns: any;
  data: Array<cmdMessage>;
}

  const Table : React.FC<inputTable> = ({ columns , data })=>{
    const filterTypes = React.useMemo(
      () => ({
        multiSelect: (rows : Row[], id: string | number, filterValues: string | any[]) => {
          if (filterValues.length === 0) return rows;
          return rows.filter((r) => filterValues.includes(r.values[id]));
        },
        // Or, override the default text filter to use
        // "startWith"
        text: (rows: Row[], id: string | number, filterValue: any) => {
          return rows.filter((row) => {
            const rowValue = row.values[id];
            return rowValue !== undefined
              ? String(rowValue)
                  .toLowerCase()
                  .startsWith(String(filterValue).toLowerCase())
              : true;
          });
        },
      }),
      []
    );
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  const displayEndRef = useRef(null) as unknown as React.MutableRefObject<HTMLInputElement>;

  const scrollToBottom = () => {
    displayEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [data]);

  // Use the state and functions returned from useTable to build your UI
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
    },
    useFlexLayout,
    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
  );

  // Render the UI for your table
  return (
    <div
      {...getTableProps()}
      className="table"
    >
      <div>
        {headerGroups.map(headerGroup => (
          <div
            {...headerGroup.getHeaderGroupProps({
              // style: { paddingRight: '15px' },
            })}
            className="tr"
          >
            {headerGroup.headers.map(column => (
              <div
                {...column.getHeaderProps()}
                className="th"
              >
                {/* {column.render("Header")}
                {/* Render the columns filter UI */}
                {/* <div>{column.canFilter ? column.render("Filter") : null}</div> */}
                <div>{column.canFilter ? column.render('Filter') : column.render('Header')}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        {...getTableBodyProps()}
        className="tbody"
      >
        {rows.map(row => {
          prepareRow(row);
          return (
            <div
              {...row.getRowProps()}
              className="tr"
            >
              {row.cells.map(cell => {
                return (
                  <div
                    {...cell.getCellProps()}
                    className="td"
                  >
                    {cell.render('Cell')}
                  </div>
                );
              })}
            </div>
          );
        })}
        <div ref = {displayEndRef}/>
      </div>
    </div>
  );
};

function Terminal() {
  type cmdMessage = {
    time: number;
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
      time: Math.floor(Date.now()/1000),
      mod: 'CMD',
      ct: 4,
      terminal: cmd,
    };
  };
  const makeReplyMsg = (msg: string) => {
    return {
      time: Math.floor(Date.now()/1000),
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

  const columns = React.useMemo(
    () => [
      {
        Header: 'Time',
        accessor: 'time',
        disableFilters: true,
        width: 30,
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
        width: 30,
      },
      {
        Header: 'Terminal Data',
        accessor: 'terminal',
        disableFilters: true,
      },
    ],
    [],
  );

  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-cmd', args => {
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
