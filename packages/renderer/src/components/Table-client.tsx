import React,
    { useRef, useEffect }     from 'react';
import type
  { Row, FilterProps }        from 'react-table';
import
{ useTable, useFlexLayout,
  useFilters, useSortBy,
  useGlobalFilter,
  useResizeColumns }          from 'react-table';

type terminalData = {
  time: string;
  mod: string;
  ct: number;
  terminal: string;
};

// Define a default UI for filtering
function DefaultColumnFilter({
  column: {filterValue, preFilteredRows, setFilter},
}: FilterProps<terminalData>) {
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

export function MultiCheckBoxColumnFilter({
  column: {filterValue, setFilter, preFilteredRows, id},
}: FilterProps<terminalData>) {
  const options = React.useMemo(() => {
    const counts = {} as {[key: string]: number};
    preFilteredRows.forEach((Row: Row<terminalData>) => {
      const x = Row.values[id].toString();
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }, [id, preFilteredRows]);

  const [checked, setChecked] = React.useState(Object.keys(options));
  // const [checked, setChecked] = React.useState([]);
  //我们事先将所有选项放进checked中并setFilter 此时我们全选了，
  //通过监听checkbox事件变化我们得到checkbox的name 从而更新我们的checked和setFilter
  const onChange = (e: {target: {name: {toString: () => any}}}) => {
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
  useEffect(()=>{
    setFilter([...checked]);
  },[filterValue==undefined]);

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
      Filter: DefaultColumnFilter,
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
      // @ts-expect-error
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
