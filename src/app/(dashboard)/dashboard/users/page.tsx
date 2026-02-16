'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  ShieldCheck,
  X,
  Mail,
  Calendar,
  Globe,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi, websiteApi } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { User, Website } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [allWebsites, setAllWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as const,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      window.location.href = '/dashboard';
      return;
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchUsers();
      fetchWebsites();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getAll();
      const usersData = response.data.data?.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebsites = async () => {
    try {
      const response = await websiteApi.getAll();
      const websitesData = response.data.data?.websites || [];
      setAllWebsites(Array.isArray(websitesData) ? websitesData : []);
    } catch (error: any) {
      console.error('Failed to fetch websites:', error);
      setAllWebsites([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        const updateData: Record<string, any> = { name: formData.name };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await userApi.update(editingUser._id, updateData);
        toast({
          variant: 'success',
          title: 'User updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await userApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        toast({
          variant: 'success',
          title: 'User created',
          description: `${formData.name} has been created successfully.`,
        });
      }
      await fetchUsers();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.delete(id);
      setUsers(users.filter((u) => u._id !== id));
      toast({
        variant: 'success',
        title: 'User deleted',
        description: 'The user has been removed.',
      });
    } catch (error: any) {
      console.error('Failed to delete user:', error);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: 'admin',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  if (!currentUser || currentUser.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage admin users</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admin users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Admin Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allWebsites.length}</p>
                <p className="text-sm text-muted-foreground">Total Websites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allWebsites.filter(w => w.assignedAdmin).length}
                </p>
                <p className="text-sm text-muted-foreground">Assigned Websites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No admin users found</h3>
              <p className="text-muted-foreground text-sm">Create a new admin user to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned Websites</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const assignedWebsites = allWebsites.filter(w =>
                    w.assignedAdmin && w.assignedAdmin._id === user._id
                  );

                  return (
                    <tr key={user._id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {assignedWebsites.length} websites
                        </span>
                        {assignedWebsites.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedWebsites.map(w => w.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(user)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingUser ? 'Edit Admin User' : 'Add Admin User'}
              </h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed after creation.</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={8}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
