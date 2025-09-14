import { AppNavbar } from '@/components/app-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
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

export function TableApp() {
  // Per-table filters for section-scoped inputs
  const [filterA, setFilterA] = useState('');
  const [filterB, setFilterB] = useState('');

  // Create independent column defs per table to avoid shared internal state
  const columnsA = useMemo(() => columns.map((c) => ({ ...c })), []);
  const columnsB = useMemo(() => columns.map((c) => ({ ...c })), []);

  const filteredDataA = useMemo(
    () =>
      initialData.filter(
        (row) => row.name.toLowerCase().includes(filterA.toLowerCase()) || row.city.toLowerCase().includes(filterA.toLowerCase())
      ),
    [filterA]
  );

  const filteredDataB = useMemo(
    () =>
      initialData.filter(
        (row) => row.name.toLowerCase().includes(filterB.toLowerCase()) || row.city.toLowerCase().includes(filterB.toLowerCase())
      ),
    [filterB]
  );

  const table = useReactTable({
    data: filteredDataA,
    columns: columnsA,
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  // Second independent table instance using same data
  const tableB = useReactTable({
    data: filteredDataB,
    columns: columnsB,
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AppNavbar />
      <main className="p-4 flex flex-col gap-y-4 w-full h-full font-sans">
        <h1 className="text-3xl font-bold mb-8 text-center">Table: Filter, Sort, Pagination</h1>
        <div className="max-w-4xl w-full mx-auto">
          <section>
            <h2 className="text-xl font-semibold mb-4">Table A</h2>
            <Input
              type="text"
              placeholder="Filter by name or city..."
              value={filterA}
              onChange={(e) => {
                setFilterA(e.target.value);
                table.setPageIndex(0);
              }}
              className="filter-input font-sans"
              aria-label="Filter by name or city"
            />
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        scope="col"
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        className="font-sans"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getPaginationRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="font-sans">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getPaginationRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="font-sans">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="font-sans">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="pagination mt-4 flex items-center gap-4">
              <Button
                onClick={() => table.setPageIndex(table.getState().pagination.pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                variant="outline"
              >
                Prev
              </Button>
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                onClick={() => table.setPageIndex(table.getState().pagination.pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Table B</h2>
            <Input
              type="text"
              placeholder="Filter by name or city..."
              value={filterB}
              onChange={(e) => {
                setFilterB(e.target.value);
                tableB.setPageIndex(0);
              }}
              className="filter-input font-sans"
              aria-label="Filter by name or city"
            />
            <Table>
              <TableHeader>
                {tableB.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        scope="col"
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        className="font-sans"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {tableB.getPaginationRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="font-sans">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableB.getPaginationRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="font-sans">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="font-sans">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="pagination mt-4 flex items-center gap-4">
              <Button
                onClick={() => tableB.setPageIndex(tableB.getState().pagination.pageIndex - 1)}
                disabled={!tableB.getCanPreviousPage()}
                variant="outline"
              >
                Prev
              </Button>
              <span>
                Page {tableB.getState().pagination.pageIndex + 1} of {tableB.getPageCount()}
              </span>
              <Button
                onClick={() => tableB.setPageIndex(tableB.getState().pagination.pageIndex + 1)}
                disabled={!tableB.getCanNextPage()}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
