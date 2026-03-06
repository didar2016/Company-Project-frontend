'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi, imageApi, getImageUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';

interface Meeting {
  title: string;
  subtitle: string;
  image: string;
  available: boolean;
}

interface MeetingFormData {
  title: string;
  subtitle: string;
  image: string;
  available: boolean;
}

const emptyForm: MeetingFormData = {
  title: '',
  subtitle: '',
  image: '',
  available: true,
};

export default function MeetingPage() {
  const { user } = useAuthStore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({ ...emptyForm });

  const imageRef = useRef<HTMLInputElement>(null);

  // Get current website ID
  const websiteId = user?.role === 'admin' ? user?.websiteId : null;

  useEffect(() => {
    if (websiteId) {
      fetchMeeting();
    }
  }, [websiteId]);

  const fetchMeeting = async () => {
    try {
      setIsLoading(true);
      const response = await websiteApi.getMeeting(websiteId!);
      setMeeting(response.data.data.meeting || null);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meeting details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteId) return;

    try {
      setIsSaving(true);
      
      // Update/Create meeting
      await websiteApi.updateMeeting(websiteId, formData);
      toast({
        title: 'Success',
        description: 'Meeting details saved successfully',
      });
      
      setShowModal(false);
      setFormData({ ...emptyForm });
      await fetchMeeting();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meeting details',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        subtitle: meeting.subtitle,
        image: meeting.image,
        available: meeting.available,
      });
    } else {
      setFormData({ ...emptyForm });
    }
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!websiteId) return;
    if (!window.confirm('Are you sure you want to delete the meeting details?')) return;

    try {
      await websiteApi.deleteMeeting(websiteId);
      toast({
        title: 'Success',
        description: 'Meeting details deleted successfully',
      });
      setMeeting(null);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meeting details',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websiteId) return;

    try {
      const imageUrl = await imageApi.upload(file, websiteId);
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
      }));
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setShowModal(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting & Events</h1>
          <p className="text-muted-foreground">
            Manage meeting facilities and event details for your website
          </p>
        </div>
        {!meeting && !isLoading && (
          <Button onClick={handleEdit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meeting Details
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : meeting ? (
        <div className="max-w-2xl">
          <Card className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardDescription>{meeting.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meeting.image && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={getImageUrl(meeting.image)}
                    alt={meeting.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">Meeting Facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <span className={`text-sm font-medium ${meeting.available ? 'text-green-600' : 'text-red-600'}`}>
                    {meeting.available ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Meeting Details</h3>
            <p className="text-muted-foreground mb-4">
              Create meeting and event details to showcase your facilities to customers.
            </p>
            <Button onClick={handleEdit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {meeting ? 'Edit Meeting Details' : 'Create Meeting Details'}
                  </CardTitle>
                  <CardDescription>
                    {meeting 
                      ? 'Update your meeting and event details'
                      : 'Create details about your meeting facilities and events'
                    }
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Executive Meeting Rooms"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g., State-of-the-art facilities for corporate events"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="available"
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="h-4 w-4 rounded border border-input bg-background"
                    />
                    <Label htmlFor="available">Meeting Facilities Available</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Room Image</Label>
                    <div className="space-y-4">
                      {formData.image && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={getImageUrl(formData.image)}
                            alt="Meeting room preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                        </Button>
                        {formData.image && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          >
                            Remove Image
                          </Button>
                        )}
                      </div>
                      <input
                        ref={imageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Meeting Details'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}