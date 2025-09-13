import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppNavbar } from '@/components/ui/app-navbar';
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
import { Moon, Sun } from 'lucide-react';
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

const LIST_OF_APPS = [
  ['meter', 'Meter'],
  ['template-crud', 'Template CRUD'],
  ['table', 'Table'],
];
const BASE_PATH = '/';

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
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <AppNavbar appList={LIST_OF_APPS} basePath={BASE_PATH} />
        <main className="p-4 flex flex-col gap-y-4 w-full h-full font-sans">
          <h1 className="text-3xl font-bold mb-8 text-center">Table: Filter, Sort, Pagination</h1>
          <div className="max-w-4xl w-full mx-auto">
            <Input
              type="text"
              placeholder="Filter by name or city..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPageIndex(0);
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
                {table.getRowModel().rows.length === 0 ? (
      <AppNavbar />
                    <TableCell colSpan={columns.length} className="font-sans">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
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
            <div className="pagination font-sans">
              <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} variant="outline">
                Prev
              </Button>
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant="outline">
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
              Prev
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant="outline">
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TableExample;
