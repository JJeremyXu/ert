import React,
    { useRef, useEffect }     from 'react';
import type { Row }           from 'react-table';
import
{ useTable, useFlexLayout,
  useFilters, useSortBy,
  useGlobalFilter,
  useResizeColumns }          from 'react-table';


export function MultiCheckBoxColumnFilter() {
  // const options = React.useMemo(() => {
  //   const counts = {} as {[key: string]: number};
  //   preFilteredRows.forEach((Row: Row<terminalData>) => {
  //     const x = Row.values[id].toString();
  //     counts[x] = (counts[x] || 0) + 1;
  //   });
  //   return counts;
  // }, [id, preFilteredRows]);
  const [mod, setMod] = React.useState([]);

  const [checked, setChecked] = React.useState<string[]>([]);
  const [checkAll, setCheckAll] = React.useState(true);
  //我们事先将所有选项放进checked中并setFilter 此时我们全选了，
  //通过监听checkbox事件变化我们得到checkbox的name 从而更新我们的checked和setFilter
  const onChange = (e: { target: { name: { toString: () => any; }; }; }) => {
    const t: string = e.target.name.toString();
    if (checked && checked.includes(t)) {
      window.electron.ipcRenderer.sendMessage('ipc-isAll', [false]);
      setChecked(prevChecked => {
        setCheckAll(false);
        // if (prevChecked.length === 1) return Object.keys(options);
        // setFilter(prevChecked.filter(v => v !== t));
        console.log('filtervalue',prevChecked.filter(v => v !== t));
        window.electron.ipcRenderer.sendMessage('ipc-filter', prevChecked.filter(v => v !== t));
        return prevChecked.filter(v => v !== t);
      });
    } else {
      window.electron.ipcRenderer.sendMessage('ipc-isAll', [false]);
      setCheckAll(false);
      // setFilter([...checked, t]);
      setChecked(prevChecked => [...prevChecked, t]);
      window.electron.ipcRenderer.sendMessage('ipc-filter', [...checked,t]);
    }
  };

  function ipcMode(){
    window.electron.ipcRenderer.on('ipc-mode', args => {
      console.log('mode',args);
      setMod(args as []);
    });
  }

  useEffect(()=>{
    if(checkAll == true){
      setChecked(mod);
      window.electron.ipcRenderer.sendMessage('ipc-filter', checked);
    }
  },[checkAll, mod]);


  useEffect(()=>{
    ipcMode();
    window.electron.ipcRenderer.sendMessage('ipc-isAll', [true]);
  },[]);

  const handleCheckAll = () => {
    window.electron.ipcRenderer.sendMessage('ipc-isAll', [true]);
    setCheckAll(true);
    setChecked(mod);
    window.electron.ipcRenderer.sendMessage('ipc-filter', mod);
    // setFilter([]);
  };
  const handleCheckNone = () => {
    setCheckAll(false);
    setChecked([]);
    window.electron.ipcRenderer.sendMessage('ipc-isAll', [false]);
    window.electron.ipcRenderer.sendMessage('ipc-filter', []);
    // setFilter([]);
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
          {mod.map((m,i) => {
            return (
              <label
                key={i}
                htmlFor={m}
              >
                <input
                  type="checkbox"
                  color="primary"
                  name={m}
                  id={m}
                  checked={checked.includes(m)}
                  onChange={onChange}
                  title={`${m}`}
                />
                {m}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type cmdMessage = {
  time: string;
  mod: string;
  ct: number;
  terminal: string;
};

interface inputTable {
  // columns: Array<Column<object>>;
  columns: any;
  data: Array<cmdMessage>;
}

export const Table: React.FC<inputTable> = ({columns, data}) => {
  const filterTypes = React.useMemo(
    () => ({
      multiSelect: (rows: Row[], id: string | number, filterValues: string | any[]) => {
        if (filterValues.length === 0) return rows;
        return rows.filter(r => filterValues.includes(r.values[id]));
      },
      // Or, override the default text filter to use
      // "startWith"
      text: (rows: Row[], id: string | number, filterValue: any) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    [],
  );

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 20, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 300, // maxWidth is only used as a limit for resizing
    }),
    [],
  );

  const displayEndRef = useRef(null) as unknown as React.MutableRefObject<HTMLInputElement>;

  const scrollToBottom = () => {
    displayEndRef.current.scrollIntoView(
      // {behavior: 'smooth'}
      );
  };

  useEffect(scrollToBottom, [data]);

  // Use the state and functions returned from useTable to build your UI
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable(
    {
      columns,
      data,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      defaultColumn,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      filterTypes,
    },
    useFlexLayout,
    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
    useResizeColumns,
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
                <div
                      {...column.getResizerProps()}
                      className={`resizer ${
                        column.isResizing ? "isResizing" : ""
                      }`}
                    />
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
        <div ref={displayEndRef} />
      </div>
    </div>
  );
};
