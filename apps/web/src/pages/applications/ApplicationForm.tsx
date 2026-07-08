import { FormEvent, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationStatusValues, createApplicationSchema } from '@candidate-tracker/shared';
import { useCreateApplication } from '../../api/applications';
import { CandidatePicker } from '../../components/CandidatePicker';
import { getErrorMessage } from '../../lib/errorMessage';

export function ApplicationForm() {
  const navigate = useNavigate();
  const createApplication = useCreateApplication();

  const [candidate, setCandidate] = useState<{ id: string; name: string; email: string } | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<(typeof applicationStatusValues)[number]>('applied');
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const payload = {
      candidateId: candidate?.id ?? '',
      jobTitle,
      company,
      status,
      appliedAt,
      salaryExpectation: salaryExpectation ? Number(salaryExpectation) : null,
      source: source || null,
      notes: notes || null,
    };

    const result = createApplicationSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      const created = await createApplication.mutateAsync(result.data);
      navigate(`/applications/${created.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save application'));
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Add application</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Candidate" error={fieldErrors.candidateId}>
          <CandidatePicker onSelect={setCandidate} />
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
          <button type="submit" disabled={createApplication.isPending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {createApplication.isPending ? 'Saving...' : 'Add application'}
          </button>
          <button type="button" onClick={() => navigate(-1)} disabled={createApplication.isPending} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
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