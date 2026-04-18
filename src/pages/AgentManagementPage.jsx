import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllAgents, updateUser } from '../services/api';
import UserCreationModal from '../components/modals/UserCreationModal';
import AgentManagementHeader from '../components/AgentManagementHeader';
import AgentTable from '../components/AgentTable';
import { SuccessMessage, EditErrorMessage } from '../components/AgentManagementMessages';


export default function AgentManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const getAvailableRoles = () => {
    if (user?.role === 'admin') {
      return ['admin', 'manager', 'caller-agent', 'closer-agent', 'client'];
    } else if (user?.role === 'manager') {
      return ['caller-agent', 'closer-agent', 'client'];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getAllAgents({ includeClients: true });
      let filteredUsers = Array.isArray(data) ? data : [];
      
      if (user?.role === 'manager') {
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
      <AgentManagementHeader
        user={user}
        onCreate={() => setShowCreateModal(true)}
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        availableRoles={availableRoles}
        getRoleLabel={getRoleLabel}
      />

      <SuccessMessage message={successMessage} />

      <AgentTable
        users={filteredUsers}
        isLoadingUsers={isLoadingUsers}
        editingUserId={editingUserId}
        editForm={editForm}
        isSavingEdit={isSavingEdit}
        availableRoles={availableRoles}
        getRoleLabel={getRoleLabel}
        getRoleColor={getRoleColor}
        onEditStart={handleEditStart}
        onEditCancel={handleEditCancel}
        onEditSave={handleEditSave}
        onDeleteUser={handleDeleteUser}
        setEditForm={setEditForm}
      />

      <EditErrorMessage error={editError && editingUserId ? editError : ""} />

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
