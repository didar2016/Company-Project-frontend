'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Loader2,
  X,
  Plus,
  Save,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi } from '@/lib/api';
import { OurStory } from '@/types';
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

interface StoryFormData {
  title: string;
  subTitle: string;
  percentage: string;
  suites: string;
  images: string[];
}

const emptyForm: StoryFormData = {
  title: '',
  subTitle: '',
  percentage: '',
  suites: '',
  images: [],
};

export default function OurStoryPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<StoryFormData>({ ...emptyForm });

  const imagesRef = useRef<HTMLInputElement>(null);
  const websiteId = user?.websiteId;

  const fetchOurStory = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getOurStory(websiteId);
      const story: OurStory = res.data.data?.ourStory || emptyForm;
      setFormData({
        title: story.title || '',
        subTitle: story.subTitle || '',
        percentage: story.percentage || '',
        suites: story.suites || '',
        images: story.images || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch our story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchOurStory();
  }, [user]);

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentCount = formData.images.length;
    const remaining = 20 - currentCount;
    if (remaining <= 0) {
      toast({ variant: 'destructive', title: 'Limit reached', description: 'Maximum 20 images allowed' });
      return;
    }
    const filesToProcess = Array.from(files).slice(0, remaining);
    try {
      const base64Images = await Promise.all(filesToProcess.map(fileToBase64));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process images' });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      await websiteApi.updateOurStory(websiteId, formData);
      toast({ variant: 'success', title: 'Saved', description: 'Our Story has been updated.' });
    } catch (error: any) {
      console.error('Failed to save our story:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save Our Story.' });
    } finally {
      setIsSaving(false);
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
          <h1 className="text-2xl font-bold">Our Story</h1>
          <p className="text-muted-foreground">Manage your Our Story section content</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formData.title ? 1 : 0}</p>
                <p className="text-sm text-muted-foreground">Story Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ImageIcon className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formData.images?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>Edit your Our Story section content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Our Story Title" />
          </div>

          {/* Sub Title */}
          <div className="space-y-2">
            <Label htmlFor="subTitle">Sub Title</Label>
            <textarea id="subTitle" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.subTitle} onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })} placeholder="Describe your story..." />
          </div>

          {/* Percentage & Suites */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage</Label>
              <Input id="percentage" value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: e.target.value })} placeholder="e.g. 95%" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suites">Suites</Label>
              <Input id="suites" value={formData.suites} onChange={(e) => setFormData({ ...formData, suites: e.target.value })} placeholder="e.g. 120 Suites" />
            </div>
          </div>

          {/* Images (max 20) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Images (max 20)</Label>
              <span className="text-xs text-muted-foreground">{formData.images.length}/20</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                  <Button variant="destructive" size="icon"
                    className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {formData.images.length < 20 && (
                <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => imagesRef.current?.click()}>
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                </div>
              )}
            </div>
            <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
