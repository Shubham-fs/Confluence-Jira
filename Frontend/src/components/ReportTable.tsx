import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmptyState from './EmptyState';

export interface Column<T> {
  id: string;
  label: string;
  /** Value used for sorting and search. */
  value: (row: T) => string | number | null | undefined;
  /** Optional custom cell renderer. */
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface ReportTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

type Order = 'asc' | 'desc';

export default function ReportTable<T>({
  rows,
  columns,
  getRowKey,
  emptyTitle,
  emptyDescription,
}: ReportTableProps<T>) {
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id ?? '');
  const [order, setOrder] = useState<Order>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((col) => {
        const v = col.value(row);
        return v != null && String(v).toLowerCase().includes(term);
      }),
    );
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === orderBy);
    if (!col) return filtered;
    const factor = order === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.value(a);
      const bv = col.value(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [filtered, columns, orderBy, order]);

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  const handleSort = (id: string) => {
    if (orderBy === id) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(id);
      setOrder('asc');
    }
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 320 }}
        />
      </Box>
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align ?? 'left'}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((row, i) => (
                  <TableRow key={getRowKey(row, i)} hover>
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align ?? 'left'}>
                        {col.render ? col.render(row) : (col.value(row) ?? '—')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={sorted.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
    </Paper>
  );
}
