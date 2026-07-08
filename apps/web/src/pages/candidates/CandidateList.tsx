import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates } from '../../api/candidates';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Pagination } from '../../components/Pagination';
import { getErrorMessage } from '../../lib/errorMessage';

const PAGE_SIZE = 10;

export function CandidateList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, isLoading, isError, error, refetch, isFetching } = useCandidates({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Candidates</h1>
        <Link
          to="/candidates/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add candidate
        </Link>
      </div>

      <input
        type="text"
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search by name, email, phone, or location..."
        className="mb-4 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      {isLoading ? (
        <TableSkeleton rows={PAGE_SIZE} cols={4} />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error, 'Failed to load candidates')} onRetry={refetch} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState message="No candidates match your search." />
      ) : (
        <>
          <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/candidates/${candidate.id}`} className="font-medium text-slate-900 hover:underline">
                        {candidate.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{candidate.email}</td>
                    <td className="px-4 py-3 text-slate-600">{candidate.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{candidate.location ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}