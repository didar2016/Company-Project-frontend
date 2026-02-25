'use client';

import { useEffect, useState, useRef } from 'react';
import { Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { websiteApi, imageApi, getImageUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';
import Image from 'next/image';

export default function SiteSettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [logo, setLogo] = useState('');
  const [footerLogo, setFooterLogo] = useState('');
  const [footerDescription, setFooterDescription] = useState('');

  const logoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);

  const websiteId = user?.websiteId;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getSiteSettings(websiteId);
      const settings = res.data.data?.siteSettings;
      if (settings) {
        setLogo(settings.logo || '');
        setFooterLogo(settings.footerLogo || '');
        setFooterDescription(settings.footerDescription || '');
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websiteId) return;
    try {
      const url = await imageApi.upload(file, websiteId);
      setLogo(url);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    }
  };

  const handleFooterLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websiteId) return;
    try {
      const url = await imageApi.upload(file, websiteId);
      setFooterLogo(url);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    }
  };

  const handleSave = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      await websiteApi.updateSiteSettings(websiteId, {
        logo,
        footerLogo,
        footerDescription,
      });
      toast({
        variant: 'success',
        title: 'Saved',
        description: 'Site settings updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save site settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your website logo and footer settings
          {user.websiteName && (
            <span className="ml-1 font-medium text-foreground">({user.websiteName})</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Website Logo
            </CardTitle>
            <CardDescription>Upload your website header logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[200px]"
              onClick={() => logoRef.current?.click()}
            >
              {logo ? (
                <div className="relative w-full flex justify-center">
                  <Image
                    src={getImageUrl(logo)}
                    alt="Logo"
                    width={800}
                    height={320}
                    quality={90}
                    className="max-h-40 w-auto object-contain rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogo('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG recommended</p>
                </>
              )}
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </CardContent>
        </Card>

        {/* Footer Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Footer Logo
            </CardTitle>
            <CardDescription>Upload your website footer logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[200px]"
              onClick={() => footerLogoRef.current?.click()}
            >
              {footerLogo ? (
                <div className="relative w-full flex justify-center">
                  <Image
                    src={getImageUrl(footerLogo)}
                    alt="Footer Logo"
                    width={800}
                    height={320}
                    quality={90}
                    className="max-h-40 w-auto object-contain rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFooterLogo('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload footer logo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG recommended</p>
                </>
              )}
            </div>
            <input
              ref={footerLogoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFooterLogoChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer Description */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Description</CardTitle>
          <CardDescription>Text that appears in the footer section of your website</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            value={footerDescription}
            onChange={(e) => setFooterDescription(e.target.value)}
            placeholder="Enter a description for your website footer..."
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
