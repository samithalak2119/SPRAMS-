import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, dashboardAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Common';
import toast from 'react-hot-toast';
import {
    FolderPlusIcon, PlusIcon, XMarkIcon, SparklesIcon,
    CheckCircleIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useForm, useFieldArray } from 'react-hook-form';

const DEPARTMENTS = ['IT', 'AMC', 'BIO'];

export default function AddProjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [improving, setImproving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        defaultValues: {
            title: '', department: '', academicYear: '', groupName: '',
            supervisor: '', abstract: '', members: [{ name: '', regNo: '' }],
        },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'members' });

    const handleImproveAbstract = async () => {
        const abstract = getValues('abstract');
        if (!abstract || abstract.trim().length < 50) {
            toast.error('Abstract must be at least 50 characters to refine');
            return;
        }
        setImproving(true);
        try {
            const { data } = await dashboardAPI.improveAbstract(abstract);
            if (data.data.improved) {
                setValue('abstract', data.data.improved);
                toast.success('Abstract refined! Review and modify as needed.');
            }
        } catch {
            toast.error('Refinement failed. Try again later.');
        } finally {
            setImproving(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await projectsAPI.create(data);
            setSubmitted(true);
            toast.success('Project submitted successfully!');
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
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Submitted!</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Your project has been successfully submitted to the archive. It is now visible in the project repository.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('/projects')} className="btn-primary">
                            View All Projects
                        </button>
                        <button onClick={() => { setSubmitted(false); }} className="btn-secondary">
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
                    <FolderPlusIcon className="w-7 h-7 text-primary-600" />
                    Submit New Project
                </h1>
                <p className="text-slate-500 mt-1">Fill in the details below to add your project to the university archive.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
                {/* Title */}
                <div>
                    <label className="label">Project Title *</label>
                    <input
                        className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                        placeholder="e.g. Smart Irrigation System using IoT Sensors"
                        {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Two-column fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Department *</label>
                        <select
                            className={`input-field ${errors.department ? 'border-red-400' : ''}`}
                            {...register('department', { required: 'Department is required' })}
                        >
                            <option value="">Select department</option>
                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
                    </div>
                    <div>
                        <label className="label">Academic Year *</label>
                        <input
                            className={`input-field ${errors.academicYear ? 'border-red-400' : ''}`}
                            placeholder="e.g. 2024/2025"
                            {...register('academicYear', {
                                required: 'Academic year required',
                                pattern: { value: /^\d{4}\/\d{4}$/, message: 'Format: YYYY/YYYY' }
                            })}
                        />
                        {errors.academicYear && <p className="text-xs text-red-500 mt-1">{errors.academicYear.message}</p>}
                    </div>
                    <div>
                        <label className="label">Group Name *</label>
                        <input
                            className={`input-field ${errors.groupName ? 'border-red-400' : ''}`}
                            placeholder="e.g. Team Alpha"
                            {...register('groupName', { required: 'Group name is required' })}
                        />
                        {errors.groupName && <p className="text-xs text-red-500 mt-1">{errors.groupName.message}</p>}
                    </div>
                    <div>
                        <label className="label">Supervisor *</label>
                        <input
                            className={`input-field ${errors.supervisor ? 'border-red-400' : ''}`}
                            placeholder="e.g. Dr. John Smith"
                            {...register('supervisor', { required: 'Supervisor is required' })}
                        />
                        {errors.supervisor && <p className="text-xs text-red-500 mt-1">{errors.supervisor.message}</p>}
                    </div>
                </div>

                {/* Abstract */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="label mb-0">Abstract *</label>
                        <button
                            type="button"
                            onClick={handleImproveAbstract}
                            disabled={improving}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors disabled:opacity-50"
                        >
                            {improving ? <Spinner size="sm" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                            {improving ? 'Refining...' : 'Refine Abstract'}
                        </button>
                    </div>
                    <textarea
                        rows={6}
                        className={`input-field resize-none ${errors.abstract ? 'border-red-400' : ''}`}
                        placeholder="Write your project abstract here (minimum 50 characters)..."
                        {...register('abstract', {
                            required: 'Abstract is required',
                            minLength: { value: 50, message: 'Minimum 50 characters' }
                        })}
                    />
                    {errors.abstract && <p className="text-xs text-red-500 mt-1">{errors.abstract.message}</p>}
                </div>

                {/* Members */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="label mb-0 flex items-center gap-1.5">
                            <UserGroupIcon className="w-4 h-4 text-slate-400" />
                            Group Members
                        </label>
                        <button
                            type="button"
                            onClick={() => append({ name: '', regNo: '' })}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            <PlusIcon className="w-3.5 h-3.5" /> Add Member
                        </button>
                    </div>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        className="input-field"
                                        placeholder="Full name"
                                        {...register(`members.${index}.name`, { required: 'Name required' })}
                                    />
                                </div>
                                <div className="w-36">
                                    <input
                                        className="input-field"
                                        placeholder="Reg. No"
                                        {...register(`members.${index}.regNo`, { required: 'Reg No required' })}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                    aria-label="Remove member"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-xs text-slate-400 italic py-2">No members added yet. Click "Add Member" above.</p>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/projects')} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size="sm" /> Submitting...
                            </span>
                        ) : 'Submit Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
