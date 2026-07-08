import { Link } from 'react-router-dom';
import { useDashboardMetrics } from '../api/dashboard';
import { MetricCard } from '../components/MetricCard';
import { StatusChart } from '../components/StatusChart';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';
import { getErrorMessage } from '../lib/errorMessage';

export function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error, 'Failed to load dashboard')} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link to="/candidates">
            <MetricCard label="Total candidates" value={data.totalCandidates} />
          </Link>
          <Link to="/applications">
            <MetricCard label="Total applications" value={data.totalApplications} />
          </Link>
          <MetricCard label="Hired this month" value={data.hiredThisMonth} />
          <MetricCard label="Rejection rate" value={`${Math.round(data.rejectionRate * 100)}%`} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Applications by status</h2>
        <StatusChart data={data.applicationsByStatus} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Latest applications</h2>
          <Link to="/applications" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {data.latestApplications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
            No applications yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Job title</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.latestApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/applications/${app.id}`} className="font-medium text-slate-900 hover:underline">
                        {app.jobTitle}
                      </Link>
                      <span className="text-slate-400"> at {app.company}</span>
                    </td>
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
        )}
      </div>
    </div>
  );
}