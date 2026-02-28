'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  Percent,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi, imageApi, getImageUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';

interface Offer {
  title: string;
  subtitle: string;
  offer_available: boolean;
  offer_percentage: number;
  offer_image: string;
}

interface OfferFormData {
  title: string;
  subtitle: string;
  offer_available: boolean;
  offer_percentage: number;
  offer_image: string;
}

const emptyForm: OfferFormData = {
  title: '',
  subtitle: '',
  offer_available: true,
  offer_percentage: 0,
  offer_image: '',
};

export default function OffersPage() {
  const { user } = useAuthStore();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<OfferFormData>({ ...emptyForm });

  const imageRef = useRef<HTMLInputElement>(null);

  // Get current website ID
  const websiteId = user?.role === 'admin' ? user?.websiteId : null;

  useEffect(() => {
    if (websiteId) {
      fetchOffer();
    }
  }, [websiteId]);

  const fetchOffer = async () => {
    try {
      setIsLoading(true);
      const response = await websiteApi.getOffer(websiteId!);
      setOffer(response.data.data.offer || null);
    } catch (error) {
      console.error('Error fetching offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch offer',
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
      
      // Update/Create offer
      await websiteApi.updateOffer(websiteId, formData);
      toast({
        title: 'Success',
        description: 'Offer saved successfully',
      });
      
      setShowModal(false);
      setFormData({ ...emptyForm });
      await fetchOffer();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save offer',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (offer) {
      setFormData({
        title: offer.title,
        subtitle: offer.subtitle,
        offer_available: offer.offer_available,
        offer_percentage: offer.offer_percentage,
        offer_image: offer.offer_image,
      });
    } else {
      setFormData({ ...emptyForm });
    }
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!websiteId) return;
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await websiteApi.deleteOffer(websiteId);
      toast({
        title: 'Success',
        description: 'Offer deleted successfully',
      });
      setOffer(null);
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete offer',
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
        offer_image: imageUrl,
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
          <h1 className="text-3xl font-bold">Special Offer</h1>
          <p className="text-muted-foreground">
            Manage the special offer promotion for your website
          </p>
        </div>
        {!offer && !isLoading && (
          <Button onClick={handleEdit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : offer ? (
        <div className="max-w-2xl">
          <Card className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
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
              <CardDescription>{offer.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.offer_image && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={getImageUrl(offer.offer_image)}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span className="font-semibold">{offer.offer_percentage}% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <span className={`text-sm font-medium ${offer.offer_available ? 'text-green-600' : 'text-red-600'}`}>
                    {offer.offer_available ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Offer</h3>
            <p className="text-muted-foreground mb-4">
              Create a special offer to start promoting deals to your customers.
            </p>
            <Button onClick={handleEdit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {offer ? 'Edit Offer' : 'Create Offer'}
                  </CardTitle>
                  <CardDescription>
                    {offer 
                      ? 'Update your special offer details'
                      : 'Create a new special offer or promotion'
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
                      placeholder="Enter offer title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter offer subtitle or description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offer_percentage">Offer Percentage (%)</Label>
                    <Input
                      id="offer_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.offer_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, offer_percentage: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter discount percentage"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="offer_available"
                      type="checkbox"
                      checked={formData.offer_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, offer_available: e.target.checked }))}
                      className="h-4 w-4 rounded border border-input bg-background"
                    />
                    <Label htmlFor="offer_available">Offer Available</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Offer Image</Label>
                    <div className="space-y-4">
                      {formData.offer_image && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={getImageUrl(formData.offer_image)}
                            alt="Offer preview"
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
                          {formData.offer_image ? 'Change Image' : 'Upload Image'}
                        </Button>
                        {formData.offer_image && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, offer_image: '' }))}
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
                      'Save Offer'
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