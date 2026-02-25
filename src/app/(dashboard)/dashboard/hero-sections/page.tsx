'use client';

import { useEffect, useState, useRef } from 'react';
import {
  ImageIcon,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';
import { websiteApi, imageApi, getImageUrl } from '@/lib/api';
import { HeroSection, HeroPageType } from '@/types';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

const PAGE_OPTIONS: { value: HeroPageType; label: string; description: string }[] = [
  { value: 'home', label: 'Home Page', description: 'Main landing page hero banner' },
  { value: 'facilities', label: 'Facilities', description: 'Hotel facilities & amenities page' },
  { value: 'about', label: 'About', description: 'About us page hero section' },
  { value: 'contact', label: 'Contact', description: 'Contact page hero section' },
  { value: 'room', label: 'Rooms', description: 'Rooms listing page hero' },
  { value: 'roomdetails', label: 'Room Details', description: 'Individual room detail page hero' },
  { value: 'location', label: 'Location', description: 'Location / map page hero' },
  { value: 'dining', label: 'Dining', description: 'Restaurant & dining page hero' },
];

interface FormState {
  image: string;
  text: string;
  subText: string;
  detailsText: string;
}

const emptyForm: FormState = { image: '', text: '', subText: '', detailsText: '' };

export default function HeroSectionsPage() {
  const { user } = useAuthStore();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPage, setExpandedPage] = useState<HeroPageType | null>(null);
  const [forms, setForms] = useState<Record<HeroPageType, FormState>>(() => {
    const initial: Record<string, FormState> = {};
    PAGE_OPTIONS.forEach((p) => (initial[p.value] = { ...emptyForm }));
    return initial as Record<HeroPageType, FormState>;
  });
  const [savingPage, setSavingPage] = useState<HeroPageType | null>(null);
  const [deletingPage, setDeletingPage] = useState<HeroPageType | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const websiteId = user?.websiteId;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchHeroSections();
  }, [user]);

  const fetchHeroSections = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getHeroSections(websiteId);
      const sections: HeroSection[] = res.data.data?.heroSections || [];
      setHeroSections(sections);

      const newForms: Record<string, FormState> = {};
      PAGE_OPTIONS.forEach((p) => {
        const existing = sections.find((s) => s.page === p.value);
        newForms[p.value] = existing
          ? { image: existing.image || '', text: existing.text || '', subText: existing.subText || '', detailsText: existing.detailsText || '' }
          : { ...emptyForm };
      });
      setForms(newForms as Record<HeroPageType, FormState>);
    } catch (error) {
      console.error('Failed to fetch hero sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (page: HeroPageType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websiteId) return;
    try {
      const url = await imageApi.upload(file, websiteId);
      updateForm(page, 'image', url);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    }
  };

  const handleSave = async (page: HeroPageType) => {
    if (!websiteId) return;
    setSavingPage(page);
    try {
      const form = forms[page];
      await websiteApi.upsertHeroSection(websiteId, {
        page,
        image: form.image,
        text: form.text,
        subText: form.subText,
        detailsText: form.detailsText,
      });
      await fetchHeroSections();
      toast({
        variant: 'success',
        title: 'Saved',
        description: `Hero section for "${PAGE_OPTIONS.find((p) => p.value === page)?.label}" saved.`,
      });
    } catch (error) {
      console.error('Failed to save hero section:', error);
    } finally {
      setSavingPage(null);
    }
  };

  const handleDelete = async (page: HeroPageType) => {
    if (!websiteId) return;
    const existing = heroSections.find((s) => s.page === page);
    if (!existing) return;
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    setDeletingPage(page);
    try {
      await websiteApi.deleteHeroSection(websiteId, existing._id);
      await fetchHeroSections();
      toast({
        variant: 'success',
        title: 'Deleted',
        description: `Hero section for "${PAGE_OPTIONS.find((p) => p.value === page)?.label}" deleted.`,
      });
    } catch (error) {
      console.error('Failed to delete hero section:', error);
    } finally {
      setDeletingPage(null);
    }
  };

  const updateForm = (page: HeroPageType, field: keyof FormState, value: string) => {
    setForms((prev) => ({
      ...prev,
      [page]: { ...prev[page], [field]: value },
    }));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hero Sections</h1>
        <p className="text-muted-foreground">
          Manage hero banners for each page of your website
          {user.websiteName && (
            <span className="ml-1 font-medium text-foreground">({user.websiteName})</span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {PAGE_OPTIONS.map((pageOpt) => {
            const existing = heroSections.find((s) => s.page === pageOpt.value);
            const isExpanded = expandedPage === pageOpt.value;
            const form = forms[pageOpt.value];
            const isSaving = savingPage === pageOpt.value;
            const isDeleting = deletingPage === pageOpt.value;

            return (
              <Card key={pageOpt.value}>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedPage(isExpanded ? null : pageOpt.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pageOpt.label}</CardTitle>
                        <CardDescription className="text-xs">{pageOpt.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {existing ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">
                          Not set
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
                    {/* Hero Image Upload */}
                    <div className="space-y-2">
                      <Label>Hero Image</Label>
                      <div
                        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[180px]"
                        onClick={() => fileInputRefs.current[pageOpt.value]?.click()}
                      >
                        {form.image ? (
                          <div className="relative w-full">
                            <Image
                              src={getImageUrl(form.image)}
                              alt="Hero preview"
                              className="w-full h-98 object-cover rounded-lg"
                              width={1920}
                              height={1080}
                              quality={90}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateForm(pageOpt.value, 'image', '');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload hero image</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={(el) => { fileInputRefs.current[pageOpt.value] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(pageOpt.value, e)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`text-${pageOpt.value}`}>Hero Text</Label>
                      <Input
                        id={`text-${pageOpt.value}`}
                        value={form.text}
                        onChange={(e) => updateForm(pageOpt.value, 'text', e.target.value)}
                        placeholder="Welcome to Our Hotel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`subtext-${pageOpt.value}`}>Hero Sub Text</Label>
                      <textarea
                        id={`subtext-${pageOpt.value}`}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                        value={form.subText}
                        onChange={(e) => updateForm(pageOpt.value, 'subText', e.target.value)}
                        placeholder="Experience luxury and comfort in the heart of the city"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`detailstext-${pageOpt.value}`}>Hero Details Text</Label>
                      <textarea
                        id={`detailstext-${pageOpt.value}`}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y"
                        value={form.detailsText}
                        onChange={(e) => updateForm(pageOpt.value, 'detailsText', e.target.value)}
                        placeholder="Detailed description about the page, services, or features that complement the main hero content"
                      />
                      <p className="text-xs text-muted-foreground">Additional descriptive text for enhanced page context</p>
                    </div>

                    

                    <div className="flex items-center gap-2 pt-2">
                      <Button onClick={() => handleSave(pageOpt.value)} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {existing ? 'Update' : 'Save'}
                      </Button>
                      {existing && (
                        <Button
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(pageOpt.value)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
