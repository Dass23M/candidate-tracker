import { useState } from 'react';
import { useCandidateSearch } from '../api/candidates';
import { useDebounce } from '../hooks/useDebounce';

interface CandidateRef {
  id: string;
  name: string;
  email: string;
}

interface CandidatePickerProps {
  initialCandidate?: CandidateRef | null;
  onSelect: (candidate: CandidateRef) => void;
  error?: string;
}

export function CandidatePicker({ initialCandidate, onSelect, error }: CandidatePickerProps) {
  const [selected, setSelected] = useState<CandidateRef | null>(initialCandidate ?? null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isFetching } = useCandidateSearch(debouncedQuery);

  function handleSelect(candidate: CandidateRef) {
    setSelected(candidate);
    setQuery('');
    setOpen(false);
    onSelect(candidate);
  }

  if (selected && !open) {
    return (
      <div>
        <div className="flex items-center justify-between rounded-md border border-slate-300 px-3 py-2 text-sm">
          <span>
            {selected.name} <span className="text-slate-400">({selected.email})</span>
          </span>
          <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">
            Change
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        autoFocus={open}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search candidates by name or email..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {debouncedQuery.trim().length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {isFetching ? (
            <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
          ) : !data || data.items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No candidates found.</div>
          ) : (
            data.items.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect({ id: c.id, name: c.name, email: c.email })}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {c.name} <span className="text-slate-400">({c.email})</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}