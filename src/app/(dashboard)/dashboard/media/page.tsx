'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Grid,
  List,
  Search,
  Copy,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebsiteStore } from '@/stores';
import { uploadApi } from '@/lib/api';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  createdAt: string;
}

export default function MediaPage() {
  const { currentWebsite, websites } = useWebsiteStore();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [selectedWebsite]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      // Mock data for demonstration
      setFiles([
        {
          _id: '1',
          filename: 'hero-banner.jpg',
          originalName: 'hero-banner.jpg',
          mimeType: 'image/jpeg',
          size: 245000,
          url: '/uploads/images/hero-banner.jpg',
          thumbnail: '/uploads/thumbnails/hero-banner.jpg',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          filename: 'room-deluxe.jpg',
          originalName: 'room-deluxe.jpg',
          mimeType: 'image/jpeg',
          size: 180000,
          url: '/uploads/images/room-deluxe.jpg',
          thumbnail: '/uploads/thumbnails/room-deluxe.jpg',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          filename: 'swimming-pool.jpg',
          originalName: 'swimming-pool.jpg',
          mimeType: 'image/jpeg',
          size: 320000,
          url: '/uploads/images/swimming-pool.jpg',
          thumbnail: '/uploads/thumbnails/swimming-pool.jpg',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'general');

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        await uploadApi.uploadImage(formData);

        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      await fetchFiles();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Add delete API call here
      setFiles(files.filter((f) => f._id !== id));
      if (selectedFile?._id === id) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((file) =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage images and files for your websites</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
            multiple
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedWebsite}
          onChange={(e) => setSelectedWebsite(e.target.value)}
        >
          <option value="all">All Websites</option>
          {websites.map((website) => (
            <option key={website._id} value={website._id}>
              {website.name}
            </option>
          ))}
        </select>
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Files Grid/List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Upload images to start building your media library
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file._id}
                  className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                    selectedFile?._id === file._id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {file.mimeType.startsWith('image/') ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Size</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
                      <tr
                        key={file._id}
                        className={`border-b hover:bg-muted/30 cursor-pointer ${
                          selectedFile?._id === file._id ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{file.originalName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{file.mimeType}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatFileSize(file.size)}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.url);
                            }}
                          >
                            {copiedUrl === file.url ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* File Preview */}
        {selectedFile && (
          <Card className="w-80 flex-shrink-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">File Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Filename</label>
                  <p className="text-sm font-medium break-all">{selectedFile.originalName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <p className="text-sm">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Size</label>
                  <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Uploaded</label>
                  <p className="text-sm">{new Date(selectedFile.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedFile.url}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedFile.url)}
                    >
                      {copiedUrl === selectedFile.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(selectedFile._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete File
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
