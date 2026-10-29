import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Checkbox, Input } from '../../components/ui/form.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';

function CategoryDialog({ open, onClose, category, onSaved }) {
    const editing = !!category;
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
    const [isActive, setIsActive] = useState(category?.isActive ?? true);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2) return setError('Enter a name (at least 2 characters)');
        const order = Number(sortOrder);
        if (!Number.isInteger(order) || order < 0) return setError('Sort order must be a whole number, 0 or more');
        setBusy(true);
        try {
            const body = { name: name.trim(), description: description.trim() || undefined, sortOrder: order };
            if (editing) await adminService.updateCategory(category._id, { ...body, description: description.trim(), isActive });
            else await adminService.createCategory(body);
            toast.success(editing ? 'Category updated' : 'Category created');
            onSaved();
            onClose();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    return (
        <Modal
            open={open}
            onClose={busy ? undefined : onClose}
            title={editing ? 'Edit category' : 'New category'}
            size="sm"
            footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="cat-form" loading={busy}>Save</Button></>}
        >
            <form id="cat-form" onSubmit={submit} noValidate className="space-y-4">
                <Input label="Name" required value={name} onChange={(e) => { setName(e.target.value); setError(''); }} data-autofocus />
                <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input label="Sort order" type="number" min={0} inputMode="numeric" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
                {editing && <Checkbox label="Active (visible when posting and filtering)" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                {error && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
            </form>
        </Modal>
    );
}

export default function AdminCategories() {
    const { data: categories, loading, error, reload } = useApi((s) => adminService.categories(s), []);
    const [editing, setEditing] = useState(null); // category | 'new'
    const [deleting, setDeleting] = useState(null);

    const remove = async () => {
        try {
            await adminService.deleteCategory(deleting._id);
            toast.success('Category deleted');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Categories</h2>
                <Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" /> New category</Button>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
                <ul className="space-y-3">
                    {categories.map((c) => (
                        <li key={c._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-2 font-bold">
                                    {c.name} {!c.isActive && <Badge tone="red">Inactive</Badge>}
                                </p>
                                <p className="text-sm text-stone-600 dark:text-stone-400">/{c.slug} · order {c.sortOrder}{c.description ? ` · ${c.description}` : ''}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>
                                <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-400" onClick={() => setDeleting(c)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editing && (
                <CategoryDialog
                    key={editing === 'new' ? 'new' : editing._id}
                    open
                    onClose={() => setEditing(null)}
                    category={editing === 'new' ? null : editing}
                    onSaved={reload}
                />
            )}
            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
                title="Delete this category?"
                confirmLabel="Delete"
                description={`"${deleting?.name}" can only be deleted if no event uses it. Otherwise deactivate it instead.`}
            />
        </div>
    );
}