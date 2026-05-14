import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { researchAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Common';
import toast from 'react-hot-toast';
import { 
    PencilSquareIcon, ArrowLeftIcon, TagIcon,
    PaperClipIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export default function AdminEditResearchPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [research, setResearch] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: '',
            description: '',
            year: CURRENT_YEAR,
        },
    });

    useEffect(() => {
        const fetchResearch = async () => {
            try {
                const { data } = await researchAPI.getById(id);
                setResearch(data.data);
                setTags(data.data.tags || []);
                reset({
                    title: data.data.title,
                    description: data.data.description,
                    year: data.data.year,
                });
            } catch (err) {
                toast.error('Failed to load research details');
                navigate('/admin/research');
            } finally {
                setLoading(false);
            }
        };
        fetchResearch();
    }, [id, reset, navigate]);

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
            setTagInput('');
        }
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            // Update research entry (excluding files for now as it's a separate flow)
            await researchAPI.update(id, { ...data, tags });
            toast.success('Research updated successfully!');
            navigate('/admin/research');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 fade-in pb-12">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/admin/research')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <PencilSquareIcon className="w-7 h-7 text-primary-600" />
                        Edit Research Entry
                    </h1>
                    <p className="text-slate-500">Update research metadata and information.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
                <div>
                    <label className="label">Research Title *</label>
                    <input
                        className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                        {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Year *</label>
                        <select className="input-field" {...register('year', { required: true })}>
                            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Tags</label>
                        <div className="flex gap-2">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                className="input-field flex-1"
                                placeholder="Add tag, press Enter"
                            />
                            <button type="button" onClick={addTag} className="btn-secondary px-3 text-sm">+</button>
                        </div>
                    </div>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs border border-primary-100">
                                <TagIcon className="w-3 h-3" />
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                                    className="text-primary-400 hover:text-primary-700 ml-1"
                                >×</button>
                            </span>
                        ))}
                    </div>
                )}

                <div>
                    <label className="label">Description *</label>
                    <textarea
                        rows={8}
                        className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
                        {...register('description', { required: 'Description is required' })}
                    />
                </div>

                <div>
                    <label className="label">Associated Files</label>
                    <div className="space-y-2">
                        {research?.files?.length > 0 ? (
                            research.files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <PaperClipIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-slate-600 truncate">{file.name}</span>
                                    </div>
                                    <span className="text-slate-400 shrink-0 ml-4">{file.type}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic">No files attached to this entry.</p>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Note: Research files can be updated by uploading a new entry.</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/admin/research')} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 bg-primary-600 hover:bg-primary-700">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size="sm" /> Updating...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
