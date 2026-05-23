import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Common';
import toast from 'react-hot-toast';
import { 
    PencilSquareIcon, XMarkIcon, UserGroupIcon, PlusIcon,
    ArrowLeftIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useForm, useFieldArray } from 'react-hook-form';

const DEPARTMENTS = ['IT', 'AMC', 'BIO'];

export default function AdminEditProjectPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [project, setProject] = useState(null);

    const { register, handleSubmit, setValue, formState: { errors }, control, reset } = useForm({
        defaultValues: {
            title: '', department: '', academicYear: '', groupName: '',
            supervisor: '', abstract: '', members: [{ name: '', regNo: '' }],
        },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'members' });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { data } = await projectsAPI.getById(id);
                setProject(data.data);
                reset({
                    title: data.data.title,
                    department: data.data.department,
                    academicYear: data.data.academicYear,
                    groupName: data.data.groupName,
                    supervisor: data.data.supervisor,
                    abstract: data.data.abstract,
                    members: data.data.members || [{ name: '', regNo: '' }]
                });
            } catch (err) {
                toast.error('Failed to load project details');
                navigate('/admin/projects');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, reset, navigate]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await projectsAPI.update(id, data);
            toast.success('Project updated successfully!');
            navigate('/admin/projects');
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
                    onClick={() => navigate('/admin/projects')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <PencilSquareIcon className="w-7 h-7 text-primary-600" />
                        Edit Project
                    </h1>
                    <p className="text-slate-500">Update project details in the archive.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
                <div>
                    <label className="label">Project Title *</label>
                    <input
                        className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                        {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Department *</label>
                        <select
                            className={`input-field ${errors.department ? 'border-red-400' : ''}`}
                            {...register('department', { required: 'Department is required' })}
                        >
                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Academic Year *</label>
                        <input
                            className={`input-field ${errors.academicYear ? 'border-red-400' : ''}`}
                            {...register('academicYear', { required: 'Academic year required' })}
                        />
                    </div>
                    <div>
                        <label className="label">Group Name *</label>
                        <input
                            className={`input-field ${errors.groupName ? 'border-red-400' : ''}`}
                            {...register('groupName', { required: 'Group name is required' })}
                        />
                    </div>
                    <div>
                        <label className="label">Supervisor *</label>
                        <input
                            className={`input-field ${errors.supervisor ? 'border-red-400' : ''}`}
                            {...register('supervisor', { required: 'Supervisor is required' })}
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Abstract *</label>
                    <textarea
                        rows={8}
                        className={`input-field resize-none ${errors.abstract ? 'border-red-400' : ''}`}
                        {...register('abstract', { required: 'Abstract is required' })}
                    />
                </div>

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
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/admin/projects')} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 text-white bg-primary-600 hover:bg-primary-700">
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
