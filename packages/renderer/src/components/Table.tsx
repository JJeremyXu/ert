import {useTable, useFlexLayout} from 'react-table';

import {useMemo} from 'react';

type cmdMessage = {
  time: string;
  mod: string;
  ct: number;
  terminal: string;
};

interface inputTable  {
  columns: any
  data: Array<cmdMessage>
}

export const Table = ({columns, data}:inputTable) => {
  // Render the UI for your table
  const defaultColumn = useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    [],
  );

  // Use the state and functions returned from useTable to build your UI

  const {getTableProps, headerGroups, rows, prepareRow} = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFlexLayout,
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
                {column.render('Header')}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tbody">
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
      </div>
    </div>
  );
};
