import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Trash2, Pencil, Save, X, CheckCircle2 } from 'lucide-react';
import { getAllAgents, updateUser } from '../services/api';
import UserCreationModal from '../components/modals/UserCreationModal';

export default function AgentManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Edit state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (user?.role === 'admin') {
      return ['admin', 'manager', 'caller-agent', 'closer-agent', 'client'];
    } else if (user?.role === 'manager') {
      return ['caller-agent', 'closer-agent', 'client'];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getAllAgents({ includeClients: true });
      // Filter users based on current user's role
      let filteredUsers = Array.isArray(data) ? data : [];
      
      if (user?.role === 'manager') {
        // Manager can only see agents/clients, not managers or admins
        filteredUsers = filteredUsers.filter(
          u => u.role === 'caller-agent' || u.role === 'closer-agent' || u.role === 'client'
        );
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserCreated = () => {
    loadUsers();
    setSuccessMessage('User created successfully');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleEditStart = (user) => {
    setEditingUserId(user._id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
    });
    setEditError('');
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditForm({ name: '', email: '', password: '', role: '' });
    setEditError('');
  };

  const handleEditSave = async (user) => {
    const trimmedName = editForm.name.trim();
    const trimmedEmail = editForm.email.trim().toLowerCase();

    if (!trimmedName) {
      setEditError('Name cannot be empty');
      return;
    }

    if (!trimmedEmail) {
      setEditError('Email cannot be empty');
      return;
    }

    // Validate password if provided
    if (editForm.password && editForm.password.length < 6) {
      setEditError('Password must be at least 6 characters');
      return;
    }

    const payload = {};
    if (trimmedName !== (user.name || '')) payload.name = trimmedName;
    if (trimmedEmail !== (user.email || '').toLowerCase()) payload.email = trimmedEmail;
    if (editForm.password) payload.password = editForm.password;
    if (editForm.role && editForm.role !== user.role) payload.role = editForm.role;

    if (Object.keys(payload).length === 0) {
      handleEditCancel();
      return;
    }

    setIsSavingEdit(true);
    try {
      const updatedUser = await updateUser(user._id, payload);

      setUsers((prevUsers) =>
        prevUsers.map((existingUser) =>
          existingUser._id === user._id
            ? {
                ...existingUser,
                name: updatedUser?.name ?? payload.name ?? existingUser.name,
                email: updatedUser?.email ?? payload.email ?? existingUser.email,
                role: updatedUser?.role ?? payload.role ?? existingUser.role,
              }
            : existingUser
        )
      );

      setSuccessMessage('User details updated successfully');
      handleEditCancel();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setEditError(error?.response?.data?.error || 'Failed to update user details');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        // Use the same delete endpoint as the modal
        const response = await fetch(`/api/auth/agents/${user._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        setUsers(users.filter(u => u._id !== user._id));
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        console.error('Failed to delete user:', error);
        setEditError('Failed to delete user');
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'caller-agent': 'Caller Agent',
      'closer-agent': 'Closer Agent',
      'client': 'Client',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-500/20 text-red-600 dark:text-red-400',
      'manager': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      'caller-agent': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      'closer-agent': 'bg-green-500/20 text-green-600 dark:text-green-400',
      'client': 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    };
    return colors[role] || 'bg-slate-500/20 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {user?.role === 'admin'
              ? 'Manage all users: administrators, managers, and agents'
              : 'Manage agents and clients'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          <span>+ Create User</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">{successMessage}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((userItem) => (
                  <React.Fragment key={userItem._id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-6 py-4">
                        {editingUserId === userItem._id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                            placeholder="User name"
                            disabled={isSavingEdit}
                          />
                        ) : (
                          <p className="font-semibold text-slate-900 dark:text-white">{userItem.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUserId === userItem._id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-3 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                            placeholder="user@email.com"
                            disabled={isSavingEdit}
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{userItem.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUserId === userItem._id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                            disabled={isSavingEdit}
                          >
                            <option value="">Select Role</option>
                            {availableRoles.map((r) => (
                              <option key={r} value={r}>
                                {getRoleLabel(r)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(userItem.role)}`}>
                            {getRoleLabel(userItem.role)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingUserId === userItem._id ? (
                            <>
                              <button
                                onClick={() => handleEditSave(userItem)}
                                disabled={isSavingEdit}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded transition disabled:opacity-50"
                                title="Save changes"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                disabled={isSavingEdit}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 rounded transition disabled:opacity-50"
                                title="Cancel edit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditStart(userItem)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded transition"
                                title="Edit user"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userItem)}
                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded transition"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editingUserId === userItem._id && (
                      <tr className="bg-slate-100 dark:bg-slate-900/50">
                        <td colSpan="4" className="px-6 py-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-slate-700 dark:text-slate-300 text-xs font-medium mb-2">
                                New Password (optional)
                              </label>
                              <input
                                type="password"
                                value={editForm.password}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                                placeholder="Leave blank to keep current password"
                                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                                disabled={isSavingEdit}
                              />
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Must be at least 6 characters if you want to change it
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Error Message */}
      {editError && editingUserId && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <p className="text-rose-400">{editError}</p>
        </div>
      )}

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
        availableRoles={availableRoles}
        userRole={user?.role}
      />
    </div>
  );
}
