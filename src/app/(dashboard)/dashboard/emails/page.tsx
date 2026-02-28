'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Trash2,
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { websiteApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';

interface ContactMessage {
  _id: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmailsPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const websiteId = user?.websiteId;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchMessages();
  }, [user, page]);

  const fetchMessages = async () => {
    if (!websiteId) return;
    try {
      setIsLoading(true);
      const res = await websiteApi.getContactMessages(websiteId, page, 15);
      const data = res.data;
      setMessages(data.data?.messages || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async (messageId: string) => {
    if (!websiteId) return;
    try {
      const res = await websiteApi.toggleMessageRead(websiteId, messageId);
      const updated = res.data.data?.message;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRead: updated.isRead } : m))
      );
    } catch (error) {
      console.error('Failed to toggle read:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!websiteId) return;
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await websiteApi.deleteContactMessage(websiteId, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setTotalCount((c) => c - 1);
      toast({
        variant: 'success',
        title: 'Deleted',
        description: 'Message deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emails</h1>
          <p className="text-muted-foreground">
            Contact messages received from your website
            {user.websiteName && (
              <span className="ml-1 font-medium text-foreground">
                ({user.websiteName})
              </span>
            )}
            <span className="ml-2 text-sm">— {totalCount} total</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMessages}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Messages submitted via the contact form</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground w-8"></th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Phone</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Message</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${
                        !msg.isRead ? 'bg-primary/5 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => handleToggleRead(msg._id)}
                          title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {msg.isRead ? (
                            <MailOpen className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{msg.email}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {msg.phone || '—'}
                      </td>
                      <td className="py-3 pr-4 max-w-xs truncate" title={msg.message}>
                        {msg.message}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {formatDate(msg.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(msg._id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
