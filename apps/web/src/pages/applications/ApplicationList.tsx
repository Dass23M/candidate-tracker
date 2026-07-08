import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationStatusValues, type ApplicationStatus } from '@candidate-tracker/shared';
import { useApplications } from '../../api/applications';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { getErrorMessage } from '../../lib/errorMessage';

const PAGE_SIZE = 10;

export function ApplicationList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, isLoading, isError, error, refetch, isFetching } = useApplications({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    appliedFrom: appliedFrom || undefined,
    appliedTo: appliedTo || undefined,
  });

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Applications</h1>
        <Link
          to="/applications/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add application
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            resetToFirstPage();
          }}
          placeholder="Search job title, company, or candidate name/email..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ApplicationStatus | '');
            resetToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {applicationStatusValues.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={appliedFrom}
          onChange={(e) => {
            setAppliedFrom(e.target.value);
            resetToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <span className="self-center text-sm text-slate-400">to</span>
        <input
          type="date"
          value={appliedTo}
          onChange={(e) => {
            setAppliedTo(e.target.value);
            resetToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={PAGE_SIZE} cols={5} />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error, 'Failed to load applications')} onRetry={refetch} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState message="No applications match your search or filters." />
      ) : (
        <>
          <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Job title</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/applications/${app.id}`} className="font-medium text-slate-900 hover:underline">
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{app.company}</td>
                    <td className="px-4 py-3">
                      <Link to={`/candidates/${app.candidateId}`} className="text-blue-600 hover:underline">
                        {app.candidateName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
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