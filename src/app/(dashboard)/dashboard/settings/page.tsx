'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  Palette,
  Save,
  Moon,
  Sun,
  Monitor,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores';

type TabType = 'profile' | 'password' | 'notifications' | 'appearance';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    timezone: 'UTC',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    bookingNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    accentColor: 'blue',
    compactMode: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'password' as const, label: 'Password', icon: <Lock className="h-4 w-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  ];

  const themeOptions = [
    { id: 'light', label: 'Light', icon: <Sun className="h-5 w-5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="h-5 w-5" /> },
    { id: 'system', label: 'System', icon: <Monitor className="h-5 w-5" /> },
  ];

  const accentColors = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'rose', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max 1MB.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profileData.timezone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, timezone: e.target.value })
                    }
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Baku">Baku (AZT)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with a mix of letters, numbers, and symbols
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    {
                      id: 'emailAlerts',
                      label: 'Email Alerts',
                      description: 'Receive important alerts via email',
                    },
                    {
                      id: 'bookingNotifications',
                      label: 'Booking Notifications',
                      description: 'Get notified when new bookings are made',
                    },
                    {
                      id: 'weeklyReports',
                      label: 'Weekly Reports',
                      description: 'Receive weekly analytics reports',
                    },
                    {
                      id: 'marketingEmails',
                      label: 'Marketing Emails',
                      description: 'Receive product updates and marketing communications',
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={notifications[item.id as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({ ...notifications, [item.id]: e.target.checked })
                          }
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors ${
                            notifications[item.id as keyof typeof notifications]
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                              notifications[item.id as keyof typeof notifications]
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            }`}
                          />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                        className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                          appearance.theme === theme.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        {theme.icon}
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accent Color</CardTitle>
                  <CardDescription>Choose your preferred accent color</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setAppearance({ ...appearance, accentColor: color.id })}
                        className={`w-10 h-10 rounded-full ${color.color} transition-transform ${
                          appearance.accentColor === color.id
                            ? 'ring-2 ring-offset-2 ring-current scale-110'
                            : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display</CardTitle>
                  <CardDescription>Customize the display settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing and padding for a denser layout
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={appearance.compactMode}
                        onChange={(e) =>
                          setAppearance({ ...appearance, compactMode: e.target.checked })
                        }
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          appearance.compactMode ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                            appearance.compactMode ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </label>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
