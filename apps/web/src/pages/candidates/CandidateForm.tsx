import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCandidateSchema } from '@candidate-tracker/shared';
import { useCandidate, useCreateCandidate, useUpdateCandidate } from '../../api/candidates';
import { getErrorMessage } from '../../lib/errorMessage';

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  notes: string;
}

const emptyForm: FormState = { name: '', email: '', phone: '', location: '', linkedinUrl: '', notes: '' };

export function CandidateForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: existing, isLoading: isLoadingExisting } = useCandidate(id);
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate(id ?? '');

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        email: existing.email,
        phone: existing.phone ?? '',
        location: existing.location ?? '',
        linkedinUrl: existing.linkedinUrl ?? '',
        notes: existing.notes ?? '',
      });
    }
  }, [existing]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      location: form.location || null,
      linkedinUrl: form.linkedinUrl || null,
      notes: form.notes || null,
    };

    const result = createCandidateSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      if (isEditMode && id) {
        const updated = await updateCandidate.mutateAsync(result.data);
        navigate(`/candidates/${updated.id}`);
      } else {
        const created = await createCandidate.mutateAsync(result.data);
        navigate(`/candidates/${created.id}`);
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save candidate'));
    }
  }

  const isSubmitting = createCandidate.isPending || updateCandidate.isPending;

  if (isEditMode && isLoadingExisting) {
    return <div className="animate-pulse text-slate-500">Loading candidate...</div>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? 'Edit candidate' : 'Add candidate'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" error={fieldErrors.name}>
          <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Location" error={fieldErrors.location}>
          <input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="LinkedIn URL" error={fieldErrors.linkedinUrl}>
          <input type="text" value={form.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Notes" error={fieldErrors.notes}>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </Field>

        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Add candidate'}
          </button>
          <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
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