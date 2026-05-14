import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Common';
import toast from 'react-hot-toast';
import {
    DocumentPlusIcon, PaperClipIcon, TagIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const ALLOWED_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'video/mp4': ['.mp4'],
};

export default function AddResearchPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            year: CURRENT_YEAR,
        },
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted]),
        accept: ALLOWED_TYPES,
        maxSize: 1073741824,
    });

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t) && tags.length < 20) {
            setTags([...tags, t]);
            setTagInput('');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('year', data.year);
            formData.append('tags', JSON.stringify(tags));
            files.forEach((f) => formData.append('files', f));

            await researchAPI.create(formData);
            setSubmitted(true);
            toast.success('Research entry submitted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto fade-in">
                <div className="card text-center py-16">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Research Submitted!</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Your research entry has been added to the repository. An automated summary will be generated shortly.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('/research')} className="btn-primary">
                            View All Research
                        </button>
                        <button onClick={() => { setSubmitted(false); setFiles([]); setTags([]); }} className="btn-secondary">
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <DocumentPlusIcon className="w-7 h-7 text-green-600" />
                    Submit New Research
                </h1>
                <p className="text-slate-500 mt-1">Add your research entry with supporting files and metadata.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
                {/* Title */}
                <div>
                    <label className="label">Research Title *</label>
                    <input
                        className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                        placeholder="e.g. Impact of Machine Learning on Healthcare Diagnostics"
                        {...register('title', { required: 'Title required', minLength: { value: 5, message: 'Min 5 chars' } })}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Year and Tags */}
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

                {/* Tags display */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs border border-primary-100">
                                <TagIcon className="w-3 h-3" />
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                                    className="text-primary-400 hover:text-primary-700 ml-1"
                                    aria-label={`Remove tag ${tag}`}
                                >×</button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="label">Description *</label>
                    <textarea
                        rows={6}
                        className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
                        placeholder="Provide a detailed description of your research..."
                        {...register('description', { required: 'Description required', minLength: { value: 20, message: 'Min 20 chars' } })}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                {/* File upload */}
                <div>
                    <label className="label">
                        Upload Files <span className="text-slate-400 font-normal">(PDF, JPG, PNG, MP3, WAV, MP4 — max 1GB each)</span>
                    </label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'}`}
                    >
                        <input {...getInputProps()} />
                        <PaperClipIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">
                            {isDragActive ? 'Drop files here...' : 'Drag & drop files or click to browse'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Supports PDF, images, audio, and video files</p>
                    </div>
                    {files.length > 0 && (
                        <div className="mt-3 space-y-1">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                                    <span className="text-slate-600 truncate">{f.name}</span>
                                    <span className="text-slate-400 mx-2">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                                    <button
                                        type="button"
                                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                                        className="text-red-400 hover:text-red-600 ml-2"
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/research')} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size="sm" /> Submitting...
                            </span>
                        ) : 'Submit Research'}
                    </button>
                </div>
            </form>
        </div>
    );
}
