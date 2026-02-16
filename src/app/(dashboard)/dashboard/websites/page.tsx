'use client';

import { useEffect, useState } from 'react';
import { Plus, Globe, Edit, Trash2, ExternalLink, Copy, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebsiteStore, useAuthStore } from '@/stores';
import { Website, User } from '@/types';
import { userApi, websiteApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function WebsitesPage() {
  const { websites, isLoading, fetchWebsites, createWebsite, updateWebsite, deleteWebsite } = useWebsiteStore();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    domain: '',
    subdomain: '',
    theme: 'default',
  });
  const [editWebsite, setEditWebsite] = useState({
    name: '',
    domain: '',
    subdomain: '',
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchUnassignedAdmins = async (currentWebsiteAdminId?: string) => {
    if (user?.role !== 'super_admin') return;
    setAdminsLoading(true);
    try {
      const res = await userApi.getAll('admin');
      const allAdmins: User[] = res.data.data.users || [];
      const assignedAdminIds = websites
        .filter((w) => w.assignedAdmin)
        .map((w) => w.assignedAdmin!._id);
      const unassigned = allAdmins.filter(
        (admin) =>
          !assignedAdminIds.includes(admin._id) ||
          admin._id === currentWebsiteAdminId
      );
      setAdmins(unassigned);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createWebsite(newWebsite);
      setShowCreateModal(false);
      setNewWebsite({ name: '', domain: '', subdomain: '', theme: 'default' });
    } catch (error: any) {
      console.error('Failed to create website:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedWebsite) return;
    setIsSubmitting(true);
    try {
      await updateWebsite(selectedWebsite._id, editWebsite);
      setShowEditModal(false);
      setSelectedWebsite(null);
      toast({
        variant: 'success',
        title: 'Website updated',
        description: `${editWebsite.name} has been updated successfully.`,
      });
    } catch (error: any) {
      console.error('Failed to update website:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      try {
        await deleteWebsite(id);
      } catch (error: any) {
        console.error('Failed to delete website:', error);
      }
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedWebsite) return;
    setIsSubmitting(true);
    try {
      await websiteApi.assignAdmin(selectedWebsite._id, selectedAdminId || null);
      await fetchWebsites();
      setShowAssignModal(false);
      setSelectedWebsite(null);
      setSelectedAdminId('');
      toast({
        variant: 'success',
        title: selectedAdminId ? 'Admin assigned' : 'Admin removed',
        description: selectedAdminId
          ? `Admin has been assigned to ${selectedWebsite.name}.`
          : `Admin has been removed from ${selectedWebsite.name}.`,
      });
    } catch (error: any) {
      console.error('Failed to assign admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUniqueId = (uniqueId: string) => {
    navigator.clipboard.writeText(uniqueId);
    toast({
      title: 'Copied',
      description: 'Unique ID copied to clipboard.',
    });
  };

  const openEditModal = (website: Website) => {
    setSelectedWebsite(website);
    setEditWebsite({
      name: website.name,
      domain: website.domain,
      subdomain: website.subdomain || '',
    });
    setShowEditModal(true);
  };

  const openAssignModal = (website: Website) => {
    setSelectedWebsite(website);
    setSelectedAdminId(website.assignedAdmin?._id || '');
    fetchUnassignedAdmins(website.assignedAdmin?._id);
    setShowAssignModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Websites</h1>
          <p className="text-muted-foreground">Manage your hotel websites</p>
        </div>
        {user?.role === 'super_admin' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website) => (
            <Card key={website._id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{website.name}</CardTitle>
                      <CardDescription className="text-xs">{website.domain}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      website.isActive
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-gray-500/10 text-gray-600'
                    }`}>
                      {website.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span className="uppercase">{website.settings?.language || 'en'}</span>
                  </div>
                  {website.uniqueId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unique ID</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded text-ellipsis overflow-hidden max-w-[120px]" title={website.uniqueId}>
                          {website.uniqueId.substring(0, 8)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyUniqueId(website.uniqueId)}
                          title="Copy Unique ID"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {website.assignedAdmin && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assigned Admin</span>
                      <span className="text-ellipsis" title={website.assignedAdmin.email}>
                        {website.assignedAdmin.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
                  {user?.role === 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(website)}
                      title="Edit Website"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {user?.role === 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignModal(website)}
                      title="Assign Admin"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => window.open(`https://${website.domain}`, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {user?.role === 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(website._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {websites.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No websites yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by creating your first hotel website
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Website
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Website</CardTitle>
              <CardDescription>Add a new hotel website to manage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Website Name</Label>
                <Input
                  id="name"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  placeholder="Grand Hotel Resort"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite({ ...newWebsite, domain: e.target.value })}
                  placeholder="www.grandhotel.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={newWebsite.subdomain}
                  onChange={(e) => setNewWebsite({ ...newWebsite, subdomain: e.target.value })}
                  placeholder="grandhotel"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && selectedWebsite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Website</CardTitle>
              <CardDescription>Update website basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Website Name</Label>
                <Input
                  id="edit-name"
                  value={editWebsite.name}
                  onChange={(e) => setEditWebsite({ ...editWebsite, name: e.target.value })}
                  placeholder="Grand Hotel Resort"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-domain">Domain</Label>
                <Input
                  id="edit-domain"
                  value={editWebsite.domain}
                  onChange={(e) => setEditWebsite({ ...editWebsite, domain: e.target.value })}
                  placeholder="www.grandhotel.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subdomain">Subdomain</Label>
                <Input
                  id="edit-subdomain"
                  value={editWebsite.subdomain}
                  onChange={(e) => setEditWebsite({ ...editWebsite, subdomain: e.target.value })}
                  placeholder="grandhotel"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWebsite(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleEdit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAssignModal && selectedWebsite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Assign Admin</CardTitle>
              <CardDescription>
                Assign an admin to manage &quot;{selectedWebsite.name}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin">Select Admin</Label>
                {adminsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading admins...</span>
                  </div>
                ) : (
                  <select
                    id="admin"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedAdminId}
                    onChange={(e) => setSelectedAdminId(e.target.value)}
                  >
                    <option value="">No Admin Assigned</option>
                    {admins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))}
                  </select>
                )}
                {!adminsLoading && admins.length === 0 && !selectedWebsite.assignedAdmin && (
                  <p className="text-xs text-muted-foreground">No unassigned admins available.</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedWebsite(null);
                    setSelectedAdminId('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAssignAdmin} disabled={isSubmitting || adminsLoading}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {selectedAdminId ? 'Assign Admin' : 'Remove Admin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
