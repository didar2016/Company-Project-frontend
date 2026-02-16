'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  BedDouble,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Loader2,
  X,
  Upload,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi } from '@/lib/api';
import { Room } from '@/types';
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

interface RoomFormData {
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  size: number;
  basePrice: number;
  mainImage: string;
  discountPercentage: string;
  detailImages: string[];
  amenities: string[];
  features: string[];
  servicesIncluded: string[];
  isAvailable: boolean;
}

const emptyForm: RoomFormData = {
  name: '',
  description: '',
  maxOccupancy: 2,
  bedType: 'Double',
  size: 300,
  basePrice: 100,
  mainImage: '',
  discountPercentage: '',
  detailImages: [],
  amenities: [],
  features: [],
  servicesIncluded: [],
  isAvailable: true,
};

export default function RoomsPage() {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({ ...emptyForm });

  const [amenityInput, setAmenityInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');

  const mainImageRef = useRef<HTMLInputElement>(null);
  const detailImagesRef = useRef<HTMLInputElement>(null);

  const websiteId = user?.websiteId;

  const fetchRooms = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getRooms(websiteId);
      setRooms(res.data.data.rooms);
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [websiteId]);

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingRoom(null);
    setAmenityInput('');
    setFeatureInput('');
    setServiceInput('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      maxOccupancy: room.maxOccupancy,
      bedType: room.bedType,
      size: room.size,
      basePrice: room.basePrice,
      mainImage: room.mainImage || '',
      discountPercentage: room.discountPercentage || '',
      detailImages: room.detailImages || [],
      amenities: room.amenities || [],
      features: room.features || [],
      servicesIncluded: room.servicesIncluded || [],
      isAvailable: room.isAvailable,
    });
    setShowModal(true);
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, mainImage: base64 }));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process image' });
    }
  };

  const handleDetailImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentCount = formData.detailImages.length;
    const remaining = 10 - currentCount;
    if (remaining <= 0) {
      toast({ variant: 'destructive', title: 'Limit reached', description: 'Maximum 10 detail images allowed' });
      return;
    }
    const filesToProcess = Array.from(files).slice(0, remaining);
    try {
      const base64Images = await Promise.all(filesToProcess.map(fileToBase64));
      setFormData((prev) => ({
        ...prev,
        detailImages: [...prev.detailImages, ...base64Images],
      }));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process images' });
    }
  };

  const removeDetailImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      detailImages: prev.detailImages.filter((_, i) => i !== index),
    }));
  };

  const addToList = (field: 'amenities' | 'features' | 'servicesIncluded', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], trimmed],
    }));
  };

  const removeFromList = (field: 'amenities' | 'features' | 'servicesIncluded', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      if (editingRoom) {
        await websiteApi.updateRoom(websiteId, editingRoom._id, formData);
        toast({ variant: 'success', title: 'Room updated', description: `${formData.name} has been updated.` });
      } else {
        await websiteApi.addRoom(websiteId, formData);
        toast({ variant: 'success', title: 'Room created', description: `${formData.name} has been created.` });
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error: any) {
      console.error('Failed to save room:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!websiteId) return;
    if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
      try {
        await websiteApi.deleteRoom(websiteId, room._id);
        toast({ variant: 'success', title: 'Room deleted', description: `${room.name} has been deleted.` });
        fetchRooms();
      } catch (error: any) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin', 'Suite', 'Bunk'];

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
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-muted-foreground">Manage your rooms and pricing</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BedDouble className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{rooms.length}</p>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{rooms.filter((r) => r.isAvailable).length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${rooms.length > 0 ? Math.min(...rooms.map((r) => r.basePrice)) : 0} - ${rooms.length > 0 ? Math.max(...rooms.map((r) => r.basePrice)) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Price Range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room._id} className="overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
              {room.mainImage ? (
                <img src={room.mainImage} alt={room.name} className="w-full h-full object-cover" />
              ) : room.images?.[0] ? (
                <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BedDouble className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                {room.discountPercentage && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                    {room.discountPercentage}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <CardContent className="pt-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg">{room.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {room.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <span>{room.bedType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{room.size} sq ft</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span>{room.basePrice}/night</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {room.detailImages?.length > 0 && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{room.detailImages.length} detail images</span>
                )}
                {room.amenities?.length > 0 && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{room.amenities.length} amenities</span>
                )}
                {room.features?.length > 0 && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{room.features.length} features</span>
                )}
                {room.servicesIncluded?.length > 0 && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{room.servicesIncluded.length} services</span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(room)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(room)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {rooms.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No rooms yet</h3>
              <p className="text-muted-foreground text-center mb-4">Add rooms to manage your hotel inventory</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Room
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <Card className="w-full max-w-2xl mx-4 my-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</CardTitle>
                  <CardDescription>{editingRoom ? 'Update room details' : 'Add a new room with all details'}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Main Image */}
              <div className="space-y-2">
                <Label>Main Image</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => mainImageRef.current?.click()}
                >
                  {formData.mainImage ? (
                    <div className="relative w-full">
                      <img src={formData.mainImage} alt="Main" className="w-full h-48 object-cover rounded-lg" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setFormData((prev) => ({ ...prev, mainImage: '' })); }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload main image</p>
                    </>
                  )}
                </div>
                <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage (optional)</Label>
                <div className="relative">
                  <Input id="discountPercentage" value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="e.g. 20% OFF" />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Deluxe Suite" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this room..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedType">Bed Type</Label>
                  <select id="bedType" className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.bedType} onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}>
                    {bedTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                  <Input id="maxOccupancy" type="number" min={1} max={20} value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sq ft)</Label>
                  <Input id="size" type="number" min={0} value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input id="basePrice" type="number" min={0} value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAvailable" checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} className="rounded border-input" />
                <Label htmlFor="isAvailable">Available</Label>
              </div>

              {/* Detail Images (max 10) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Room Detail Images (max 10)</Label>
                  <span className="text-xs text-muted-foreground">{formData.detailImages.length}/10</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {formData.detailImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={img} alt={`Detail ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                      <Button variant="destructive" size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeDetailImage(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.detailImages.length < 10 && (
                    <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => detailImagesRef.current?.click()}>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add</span>
                    </div>
                  )}
                </div>
                <input ref={detailImagesRef} type="file" accept="image/*" multiple className="hidden" onChange={handleDetailImagesChange} />
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="e.g. Free Wi-Fi"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('amenities', amenityInput); setAmenityInput(''); } }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => { addToList('amenities', amenityInput); setAmenityInput(''); }} disabled={!amenityInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.amenities.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                      {item}
                      <button type="button" onClick={() => removeFromList('amenities', index)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="e.g. Large double bed with seating area"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('features', featureInput); setFeatureInput(''); } }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => { addToList('features', featureInput); setFeatureInput(''); }} disabled={!featureInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 text-sm px-3 py-1 rounded-full">
                      {item}
                      <button type="button" onClick={() => removeFromList('features', index)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Services Included */}
              <div className="space-y-2">
                <Label>Services Included</Label>
                <div className="flex gap-2">
                  <Input value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} placeholder="e.g. Daily housekeeping"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('servicesIncluded', serviceInput); setServiceInput(''); } }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => { addToList('servicesIncluded', serviceInput); setServiceInput(''); }} disabled={!serviceInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.servicesIncluded.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 text-sm px-3 py-1 rounded-full">
                      {item}
                      <button type="button" onClick={() => removeFromList('servicesIncluded', index)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSaving || !formData.name}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
