import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentResearchAPI } from '../../services/api';
import { PageSpinner, EmptyState } from '../../components/ui/Common';
import toast from 'react-hot-toast';
import {
    PlusIcon, DocumentTextIcon, PencilSquareIcon,
    TrashIcon, ChevronDownIcon, ChevronUpIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const INITIAL_FORM = {
    title: '', abstract: '', department: '', academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    supervisor: '', keywords: '',
};

export default function StudentResearchPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const loadEntries = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await studentResearchAPI.getAll({ page, limit: 10 });
            setEntries(data.data.entries);
            setPagination(data.data.pagination);
        } catch {
            toast.error('Failed to load research entries');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        document.title = 'Student Research | SPRAMS';
        loadEntries();
    }, [loadEntries]);

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setFiles([]);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (entry) => {
        setForm({
            title: entry.title || '',
            abstract: entry.abstract || '',
            department: entry.department || '',
            academicYear: entry.academicYear || '',
            supervisor: entry.supervisor || '',
            keywords: Array.isArray(entry.keywords) ? entry.keywords.join(', ') : (entry.keywords || ''),
        });
        setEditingId(entry._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('abstract', form.abstract);
            formData.append('department', form.department);
            formData.append('academicYear', form.academicYear);
            formData.append('supervisor', form.supervisor);
            formData.append('keywords', JSON.stringify(
                form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
            ));
            for (const file of files) {
                formData.append('files', file);
            }

            if (editingId) {
                await studentResearchAPI.update(editingId, formData);
                toast.success('Research updated');
            } else {
                await studentResearchAPI.create(formData);
                toast.success('Research submitted');
            }
            resetForm();
            loadEntries();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this research?')) return;
        try {
            await studentResearchAPI.delete(id);
            toast.success('Research deleted');
            loadEntries();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const statusColors = {
        Proposed: 'badge-yellow',
        Ongoing: 'badge-purple',
        Completed: 'badge-blue',
        Approved: 'badge-green',
        Unfinished: 'badge-red',
    };

    if (loading && entries.length === 0) return <PageSpinner />;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BookOpenIcon className="w-7 h-7 text-green-600" />
                        My Research
                    </h1>
                    <p className="text-slate-500 mt-1">Submit and track your research work</p>
                </div>
                <button
                    onClick={() => { showForm ? resetForm() : setShowForm(true); }}
                    className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    <PlusIcon className="w-4 h-4" />
                    {showForm ? 'Cancel' : 'Submit Research'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card space-y-4">
                    <h2 className="font-semibold text-slate-700">
                        {editingId ? 'Edit Research' : 'New Research Submission'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Title *</label>
                            <input type="text" required minLength={5} className="form-input"
                                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Abstract *</label>
                            <textarea required minLength={50} rows={4} className="form-input"
                                value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Department *</label>
                            <input type="text" required className="form-input"
                                value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Academic Year *</label>
                            <input type="text" required pattern="\d{4}/\d{4}" placeholder="e.g. 2023/2024" title="Must be in format YYYY/YYYY (e.g. 2023/2024)" className="form-input"
                                value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Supervisor</label>
                            <input type="text" className="form-input" placeholder="Dr./Prof. Name"
                                value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Keywords (comma-separated)</label>
                            <input type="text" className="form-input" placeholder="AI, IoT, ML"
                                value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Attach Files</label>
                        <input type="file" multiple className="form-input"
                            onChange={(e) => setFiles([...e.target.files])} />
                        <p className="text-xs text-slate-400 mt-1">Max 10 files, 1GB each</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={submitting}
                            className="btn-primary bg-green-600 hover:bg-green-700">
                            {submitting ? 'Saving...' : (editingId ? 'Update' : 'Submit Research')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            )}

            {/* Entries */}
            {entries.length === 0 && !loading ? (
                <EmptyState icon={DocumentTextIcon} title="No Research" message="Submit your first research entry to get started." />
            ) : (
                <div className="space-y-3">
                    {entries.map((entry) => (
                        <div key={entry._id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <BookOpenIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-semibold text-slate-800 text-sm truncate">{entry.title}</h3>
                                        <span className={`badge ${statusColors[entry.status] || 'badge-blue'}`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {entry.department} · {entry.academicYear}
                                        {entry.supervisor && ` · Supervisor: ${entry.supervisor}`}
                                    </p>

                                    {expandedId === entry._id && (
                                        <div className="mt-3 space-y-2 text-sm text-slate-600 border-t pt-3">
                                            <p><strong>Abstract:</strong> {entry.abstract}</p>
                                            {entry.keywords?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {entry.keywords.map((kw, i) => (
                                                        <span key={i} className="badge badge-green text-xs">{kw}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {entry.files?.length > 0 && (
                                                <p><strong>Files:</strong> {entry.files.length} attached</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}
                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                                    >
                                        {expandedId === entry._id ?
                                            <ChevronUpIcon className="w-4 h-4" /> :
                                            <ChevronDownIcon className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleEdit(entry)}
                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500" title="Edit">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(entry._id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="btn-secondary text-xs disabled:opacity-50">Previous</button>
                            <span className="text-sm text-slate-500 flex items-center">Page {page} of {pagination.totalPages}</span>
                            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="btn-secondary text-xs disabled:opacity-50">Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
