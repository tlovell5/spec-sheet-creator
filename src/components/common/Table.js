import React from 'react';

/**
 * Reusable table component
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions [{id, label, width, align, render}]
 * @param {Array} props.data - Array of data objects
 * @param {function} props.onRowClick - Row click handler
 * @param {string} props.className - Additional CSS class
 * @param {boolean} props.striped - Whether to use striped rows
 * @param {boolean} props.bordered - Whether to show borders
 * @param {boolean} props.hover - Whether to show hover effect
 * @param {string} props.emptyMessage - Message to show when data is empty
 */
const Table = ({
  columns = [],
  data = [],
  onRowClick,
  className = '',
  striped = true,
  bordered = true,
  hover = true,
  emptyMessage = 'No data available'
}) => {
  const tableClasses = [
    'table',
    striped ? 'table-striped' : '',
    bordered ? 'table-bordered' : '',
    hover ? 'table-hover' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="table-responsive">
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.id} 
                style={{ 
                  width: column.width || 'auto',
                  textAlign: column.align || 'left'
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td 
                    key={`${rowIndex}-${column.id}`} 
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {column.render 
                      ? column.render(row[column.id], row, rowIndex) 
                      : row[column.id]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
