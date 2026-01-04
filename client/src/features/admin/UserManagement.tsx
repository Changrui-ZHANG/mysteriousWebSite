import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { fetchJson, postJson, putJson, deleteJson } from '../../api/httpClient';

interface User {
    id: string;
    username: string;
    plainPassword?: string;
}

interface UserManagementProps {
    isOpen: boolean;
    onClose: () => void;
    superAdminCode: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ isOpen, onClose, superAdminCode }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const url = `${API_ENDPOINTS.SUPER_ADMIN.USERS}?superAdminCode=${superAdminCode}`;
            const data = await fetchJson<User[]>(url);
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.unknown_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.confirm_delete_user'))) return;

        try {
            const url = `${API_ENDPOINTS.SUPER_ADMIN.USER(id)}?superAdminCode=${superAdminCode}`;
            await deleteJson(url);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert(t('admin.error_delete_user'));
        }
    };

    const handleCreate = async (user: User) => {
        try {
            const { username, plainPassword } = user;
            const url = `${API_ENDPOINTS.SUPER_ADMIN.USERS}?superAdminCode=${superAdminCode}`;
            const newUser = await postJson<User>(url, { username, password: plainPassword });
            setUsers([...users, newUser]);
            setEditingUser(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : t('admin.error_create_user'));
        }
    };

    const handleSave = async (user: User) => {
        try {
            const { id, username, plainPassword } = user;
            const url = `${API_ENDPOINTS.SUPER_ADMIN.USER(id)}?superAdminCode=${superAdminCode}`;
            await putJson(url, { username, password: plainPassword });
            setUsers(users.map(u => u.id === id ? user : u));
            setEditingUser(null);
        } catch (err) {
            alert(t('admin.error_update_user'));
        }
    };

    const togglePasswordVisibility = (id: string) => {
        setShowPasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="user-management-modal w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        {t('auth.super_admin_panel')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-primary" aria-label={t('common.close')}>
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="mb-4 text-right">
                        <button
                            onClick={() => setEditingUser({ id: 'new', username: '', plainPassword: '' })}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md font-bold text-sm"
                        >
                            + {t('admin.add_user')}
                        </button>
                    </div>

                    {editingUser?.id === 'new' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="admin-panel-section mb-4"
                        >
                            <h3 className="font-bold mb-3">{t('admin.add_new_user')}</h3>
                            <div className="flex gap-3 mb-3">
                                <input
                                    placeholder={t('admin.username')}
                                    value={editingUser.username}
                                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                    className="user-management-input flex-1"
                                />
                                <input
                                    placeholder={t('admin.password')}
                                    value={editingUser.plainPassword || ''}
                                    onChange={e => setEditingUser({ ...editingUser, plainPassword: e.target.value })}
                                    className="user-management-input flex-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                >
                                    {t('admin.cancel')}
                                </button>
                                <button
                                    onClick={() => handleCreate(editingUser)}
                                    disabled={!editingUser.username || !editingUser.plainPassword}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                                >
                                    {t('admin.create')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-10">{t('admin.loading')}</div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-10">{error}</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700/30">
                                    <th className="p-3">{t('admin.username')}</th>
                                    <th className="p-3">{t('admin.password')}</th>
                                    <th className="p-3 text-right">{t('admin.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-gray-700/10 hover:bg-gray-500/5">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <td className="p-3">
                                                    <input
                                                        value={editingUser.username}
                                                        onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                                        className="user-management-input w-full"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        value={editingUser.plainPassword || ''}
                                                        onChange={e => setEditingUser({ ...editingUser, plainPassword: e.target.value })}
                                                        className="user-management-input w-full"
                                                    />
                                                </td>
                                                <td className="p-3 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(editingUser)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                    >
                                                        {t('admin.save_changes')}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(null)}
                                                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                    >
                                                        {t('admin.cancel')}
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 font-medium">{user.username}</td>
                                                <td className="p-3 font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>{showPasswords[user.id] ? user.plainPassword : '••••••••'}</span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(user.id)}
                                                            className="text-xs opacity-50 hover:opacity-100"
                                                            title={showPasswords[user.id] ? t('admin.hide_password') : t('admin.show_password')}
                                                        >
                                                            {showPasswords[user.id] ? '👁️' : '🔒'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                        >
                                                            {t('admin.edit_user')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                                        >
                                                            {t('admin.delete_user')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserManagement;
