import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationStatusValues, updateApplicationSchema } from '@candidate-tracker/shared';
import { useApplication, useDeleteApplication, useUpdateApplication } from '../../api/applications';
import { CandidatePicker } from '../../components/CandidatePicker';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorState } from '../../components/ErrorState';
import { getErrorMessage } from '../../lib/errorMessage';

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useApplication(id);
  const updateApplication = useUpdateApplication(id ?? '');
  const deleteApplication = useDeleteApplication();

  const [candidate, setCandidate] = useState<{ id: string; name: string; email: string } | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<(typeof applicationStatusValues)[number]>('applied');
  const [appliedAt, setAppliedAt] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setCandidate(data.candidate);
      setJobTitle(data.jobTitle);
      setCompany(data.company);
      setStatus(data.status);
      setAppliedAt(new Date(data.appliedAt).toISOString().slice(0, 10));
      setSalaryExpectation(data.salaryExpectation != null ? String(data.salaryExpectation) : '');
      setSource(data.source ?? '');
      setNotes(data.notes ?? '');
    }
  }, [data]);

  if (isLoading) {
    return <div className="animate-pulse text-slate-500">Loading application...</div>;
  }

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error, 'Failed to load application')} onRetry={refetch} />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const payload = {
      candidateId: candidate?.id,
      jobTitle,
      company,
      status,
      appliedAt,
      salaryExpectation: salaryExpectation ? Number(salaryExpectation) : null,
      source: source || null,
      notes: notes || null,
    };

    const result = updateApplicationSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await updateApplication.mutateAsync(result.data);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save application'));
    }
  }

  async function handleDelete() {
    if (!id) return;
    await deleteApplication.mutateAsync(id);
    navigate('/applications');
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{data.jobTitle}</h1>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        Candidate:{' '}
        <Link to={`/candidates/${data.candidate.id}`} className="font-medium text-blue-600 hover:underline">
          {data.candidate.name} ({data.candidate.email})
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Candidate" error={fieldErrors.candidateId}>
          <CandidatePicker initialCandidate={data.candidate} onSelect={setCandidate} />
        </Field>
        <Field label="Job title" error={fieldErrors.jobTitle}>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Company" error={fieldErrors.company}>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Status" error={fieldErrors.status}>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize">
            {applicationStatusValues.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Applied date" error={fieldErrors.appliedAt}>
          <input type="date" value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Salary expectation" error={fieldErrors.salaryExpectation}>
          <input type="number" value={salaryExpectation} onChange={(e) => setSalaryExpectation(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Source" error={fieldErrors.source}>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Notes" error={fieldErrors.notes}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>

        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={updateApplication.isPending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {updateApplication.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" onClick={() => navigate('/applications')} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Back to list
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete application?"
        description={`This will permanently delete the ${data.jobTitle} application at ${data.company}.`}
        isLoading={deleteApplication.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}