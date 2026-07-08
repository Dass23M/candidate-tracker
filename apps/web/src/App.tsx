import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/candidates/CandidateList';
import { CandidateDetail } from './pages/candidates/CandidateDetail';
import { CandidateForm } from './pages/candidates/CandidateForm';
import { ApplicationList } from './pages/applications//ApplicationList';
import { ApplicationDetail } from './pages/applications/ApplicationDetail';
import { ApplicationForm } from './pages/applications/ApplicationForm';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/candidates/new" element={<CandidateForm />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/candidates/:id/edit" element={<CandidateForm />} />
        <Route path="/applications" element={<ApplicationList />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
      </Route>
    </Routes>
  );
}