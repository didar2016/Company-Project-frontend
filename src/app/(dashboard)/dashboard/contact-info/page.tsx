'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, MapPin, Mail, Phone, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { websiteApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';

export default function ContactInfoPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const websiteId = user?.websiteId;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchContactInfo();
  }, [user]);

  const fetchContactInfo = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getContactInfo(websiteId);
      const info = res.data.data?.contactInfo;
      if (info) {
        setLocation(info.location || '');
        setEmail(info.email || '');
        setNumber(info.number || '');
        setFacebook(info.facebook || '');
        setInstagram(info.instagram || '');
        setLinkedin(info.linkedin || '');
      }
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!websiteId) return;
    try {
      setIsSaving(true);
      await websiteApi.updateContactInfo(websiteId, {
        location,
        email,
        number,
        facebook,
        instagram,
        linkedin,
      });
      toast({
        variant: 'success',
        title: 'Saved',
        description: 'Contact info updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save contact info:', error);
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
        <h1 className="text-2xl font-bold">Contact Info</h1>
        <p className="text-muted-foreground">
          Manage your website contact details and social media links
          {user.websiteName && (
            <span className="ml-1 font-medium text-foreground">({user.websiteName})</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Your hotel location, email, and phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. 123 Main Street, City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. info@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="number"
                type="tel"
                placeholder="e.g. +1 234 567 890"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Your hotel social media profile URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourhotel"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourhotel"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/company/yourhotel"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
