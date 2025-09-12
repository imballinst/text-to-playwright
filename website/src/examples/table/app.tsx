import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState } from 'react';
import './app.css';

const initialData = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 25, city: 'London' },
  { id: 3, name: 'Charlie', age: 35, city: 'Paris' },
  { id: 4, name: 'David', age: 28, city: 'Berlin' },
  { id: 5, name: 'Eve', age: 22, city: 'Tokyo' },
  { id: 6, name: 'Frank', age: 40, city: 'Sydney' },
  { id: 7, name: 'Grace', age: 27, city: 'Toronto' },
  { id: 8, name: 'Heidi', age: 32, city: 'San Francisco' },
  { id: 9, name: 'Ivan', age: 29, city: 'Moscow' },
  { id: 10, name: 'Judy', age: 31, city: 'Amsterdam' }
];

const PAGE_SIZE = 5;

function TableExample() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  const columns: ColumnDef<(typeof initialData)[0]>[] = [
    {
      accessorKey: 'id',
      header: () => 'ID',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'age',
      header: () => 'Age',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'city',
      header: () => 'City',
      cell: (info) => info.getValue()
    }
  ];

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      globalFilter,
      pagination: { pageIndex, pageSize: PAGE_SIZE }
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      let nextPageIndex = 0;
      if (typeof updater === 'function') {
        const next = updater({ pageIndex, pageSize: PAGE_SIZE });
        nextPageIndex = next.pageIndex;
      } else {
        nextPageIndex = updater.pageIndex;
      }
      setPageIndex(nextPageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const name = row.original.name.toLowerCase();
      const city = row.original.city.toLowerCase();
      return name.includes(filterValue.toLowerCase()) || city.includes(filterValue.toLowerCase());
    },
    debugTable: false
  });

  return (
    <div className="table-demo">
      <h2>Table: Filter, Sort, Pagination</h2>
      <input
        type="text"
        placeholder="Filter by name or city..."
        value={globalFilter}
        onChange={(e) => {
          setGlobalFilter(e.target.value);
          setPageIndex(0);
        }}
        className="filter-input"
      />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data found.</td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Prev
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}

export default TableExample;
