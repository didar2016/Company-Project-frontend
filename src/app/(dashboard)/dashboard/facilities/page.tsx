'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Building,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi } from '@/lib/api';
import { Facility } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface FacilityFormData {
  image: string;
  title: string;
  subTitle: string;
}

const emptyForm: FacilityFormData = {
  image: '',
  title: '',
  subTitle: '',
};

export default function FacilitiesPage() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<FacilityFormData>({ ...emptyForm });

  const imageRef = useRef<HTMLInputElement>(null);
  const websiteId = user?.websiteId;

  const fetchFacilities = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getFacilities(websiteId);
      setFacilities(res.data.data?.facilities || []);
    } catch (error: any) {
      console.error('Failed to fetch facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchFacilities();
  }, [user]);

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingFacility(null);
  };

  const openCreate = () => {
    if (facilities.length >= 6) {
      toast({ variant: 'destructive', title: 'Limit reached', description: 'Maximum 6 facilities allowed' });
      return;
    }
    resetForm();
    setShowModal(true);
  };

  const openEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      image: facility.image || '',
      title: facility.title || '',
      subTitle: facility.subTitle || '',
    });
    setShowModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process image' });
    }
  };

  const handleSubmit = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      if (editingFacility) {
        await websiteApi.updateFacility(websiteId, editingFacility._id, formData);
        toast({ variant: 'success', title: 'Updated', description: 'Facility has been updated.' });
      } else {
        await websiteApi.addFacility(websiteId, formData);
        toast({ variant: 'success', title: 'Created', description: 'Facility has been created.' });
      }
      setShowModal(false);
      resetForm();
      fetchFacilities();
    } catch (error: any) {
      console.error('Failed to save facility:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (facility: Facility) => {
    if (!websiteId) return;
    if (confirm(`Are you sure you want to delete "${facility.title}"?`)) {
      try {
        await websiteApi.deleteFacility(websiteId, facility._id);
        toast({ variant: 'success', title: 'Deleted', description: `"${facility.title}" has been deleted.` });
        fetchFacilities();
      } catch (error: any) {
        console.error('Failed to delete facility:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage your hotel facilities (max 6)</p>
        </div>
        <Button onClick={openCreate} disabled={facilities.length >= 6}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{facilities.length} / 6</p>
              <p className="text-sm text-muted-foreground">Facilities Added</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <Card key={facility._id} className="overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
              {facility.image ? (
                <img src={facility.image} alt={facility.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <CardContent className="pt-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg">{facility.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{facility.subTitle}</p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(facility)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(facility)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {facilities.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No facilities yet</h3>
              <p className="text-muted-foreground text-center mb-4">Add facilities to showcase your hotel amenities</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Facility
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <Card className="w-full max-w-lg mx-4 my-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{editingFacility ? 'Edit Facility' : 'Add Facility'}</CardTitle>
                  <CardDescription>{editingFacility ? 'Update facility details' : 'Add a new facility'}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image */}
              <div className="space-y-2">
                <Label>Image</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => imageRef.current?.click()}
                >
                  {formData.image ? (
                    <div className="relative w-full">
                      <img src={formData.image} alt="Facility" className="w-full h-48 object-cover rounded-lg" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setFormData((prev) => ({ ...prev, image: '' })); }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                    </>
                  )}
                </div>
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Facility name" />
              </div>

              {/* Sub Title */}
              <div className="space-y-2">
                <Label htmlFor="subTitle">Sub Title</Label>
                <textarea id="subTitle" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.subTitle} onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })} placeholder="Describe this facility..." />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSaving || !formData.title}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingFacility ? 'Update Facility' : 'Add Facility'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
