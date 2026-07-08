import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCandidate, useDeleteCandidate } from '../../api/candidates';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorState } from '../../components/ErrorState';
import { getErrorMessage } from '../../lib/errorMessage';

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: candidate, isLoading, isError, error, refetch } = useCandidate(id);
  const deleteCandidate = useDeleteCandidate();

  if (isLoading) {
    return <div className="animate-pulse text-slate-500">Loading candidate...</div>;
  }

  if (isError || !candidate) {
    return <ErrorState message={getErrorMessage(error, 'Failed to load candidate')} onRetry={refetch} />;
  }

  async function handleDelete() {
    if (!id) return;
    await deleteCandidate.mutateAsync(id);
    navigate('/candidates');
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{candidate.name}</h1>
        <div className="flex gap-2">
          <Link
            to={`/candidates/${candidate.id}/edit`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 text-sm">
        <div>
          <div className="text-xs font-medium uppercase text-slate-400">Email</div>
          <div className="mt-1 text-slate-900">{candidate.email}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-slate-400">Phone</div>
          <div className="mt-1 text-slate-900">{candidate.phone ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-slate-400">Location</div>
          <div className="mt-1 text-slate-900">{candidate.location ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-slate-400">LinkedIn</div>
          <div className="mt-1 text-slate-900">
            {candidate.linkedinUrl ? (
              <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {candidate.linkedinUrl}
              </a>
            ) : (
              '—'
            )}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs font-medium uppercase text-slate-400">Notes</div>
          <div className="mt-1 whitespace-pre-wrap text-slate-900">{candidate.notes ?? '—'}</div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Applications</h2>
      {candidate.applications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
          No applications yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Job title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidate.applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/applications/${app.id}`} className="font-medium text-slate-900 hover:underline">
                      {app.jobTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{app.company}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{app.status}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete candidate?"
        description={`This will remove ${candidate.name} from all lists. Their applications remain in the database, but the candidate record is hidden.`}
        isLoading={deleteCandidate.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}