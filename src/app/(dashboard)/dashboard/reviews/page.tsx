'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Star,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  MessageSquare,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi } from '@/lib/api';
import { Review } from '@/types';
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

interface ReviewFormData {
  avatar: string;
  name: string;
  review: string;
  rating: number;
}

const emptyForm: ReviewFormData = {
  avatar: '',
  name: '',
  review: '',
  rating: 5,
};

function StarRating({ rating, onChange, readonly = false }: { rating: number; onChange?: (r: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${!readonly ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({ ...emptyForm });

  const avatarRef = useRef<HTMLInputElement>(null);
  const websiteId = user?.websiteId;

  const fetchReviews = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getReviews(websiteId);
      setReviews(res.data.data?.reviews || []);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchReviews();
  }, [user]);

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingReview(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      avatar: review.avatar || '',
      name: review.name || '',
      review: review.review || '',
      rating: review.rating || 5,
    });
    setShowModal(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, avatar: base64 }));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process image' });
    }
  };

  const handleSubmit = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      if (editingReview) {
        await websiteApi.updateReview(websiteId, editingReview._id, formData);
        toast({ variant: 'success', title: 'Updated', description: 'Review has been updated.' });
      } else {
        await websiteApi.addReview(websiteId, formData);
        toast({ variant: 'success', title: 'Created', description: 'Review has been created.' });
      }
      setShowModal(false);
      resetForm();
      fetchReviews();
    } catch (error: any) {
      console.error('Failed to save review:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!websiteId) return;
    if (confirm(`Are you sure you want to delete the review by "${review.name}"?`)) {
      try {
        await websiteApi.deleteReview(websiteId, review._id);
        toast({ variant: 'success', title: 'Deleted', description: `Review by "${review.name}" has been deleted.` });
        fetchReviews();
      } catch (error: any) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

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
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage guest reviews and ratings</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-400" />
              <div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{reviews.filter((r) => r.rating >= 4).length}</p>
                <p className="text-sm text-muted-foreground">Positive Reviews (4+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <Card key={review._id} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.name} className="h-12 w-12 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{review.name}</h3>
                  <StarRating rating={review.rating} readonly />
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-4 mb-4">&ldquo;{review.review}&rdquo;</p>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(review)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(review)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground text-center mb-4">Add guest reviews to build trust and credibility</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Review
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
                  <CardTitle>{editingReview ? 'Edit Review' : 'Add Review'}</CardTitle>
                  <CardDescription>{editingReview ? 'Update review details' : 'Add a new guest review'}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => avatarRef.current?.click()}
                  >
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Click to upload avatar image</p>
                    {formData.avatar && (
                      <Button variant="ghost" size="sm" className="text-destructive mt-1 h-auto p-0"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Guest name" />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating rating={formData.rating} onChange={(r) => setFormData({ ...formData, rating: r })} />
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <Label htmlFor="review">Review</Label>
                <textarea id="review" rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} placeholder="Write the review..." />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSaving || !formData.name || !formData.review}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingReview ? 'Update Review' : 'Add Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
