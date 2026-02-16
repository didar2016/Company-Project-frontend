import { create } from 'zustand';
import { Website } from '@/types';
import { websiteApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface WebsiteState {
  websites: Website[];
  currentWebsite: Website | null;
  isLoading: boolean;
  error: string | null;
  
  fetchWebsites: () => Promise<void>;
  switchWebsite: (id: string) => Promise<void>;
  createWebsite: (data: Partial<Website>) => Promise<void>;
  updateWebsite: (id: string, data: Partial<Website>) => Promise<void>;
  deleteWebsite: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWebsiteStore = create<WebsiteState>()(
  (set, get) => ({
    websites: [],
    currentWebsite: null,
    isLoading: false,
    error: null,

    fetchWebsites: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await websiteApi.getAll();
        const websites = response.data.data.websites;
        
        set({
          websites,
          isLoading: false,
          // Set first website as current if none selected
          currentWebsite: get().currentWebsite || websites[0] || null,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to fetch websites',
          isLoading: false,
        });
      }
    },

    switchWebsite: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await websiteApi.switch(id);
        set({
          currentWebsite: response.data.data.website,
          isLoading: false,
        });
        toast({
          variant: 'success',
          title: 'Website switched',
          description: `Now managing ${response.data.data.website.name}`,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to switch website',
          isLoading: false,
        });
      }
    },

    createWebsite: async (data: Partial<Website>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await websiteApi.create(data);
        const newWebsite = response.data.data.website;
        
        set((state) => ({
          websites: [...state.websites, newWebsite],
          isLoading: false,
        }));

        toast({
          variant: 'success',
          title: 'Website created',
          description: `${newWebsite.name} has been created successfully.`,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to create website',
          isLoading: false,
        });
        throw error;
      }
    },

    updateWebsite: async (id: string, data: Partial<Website>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await websiteApi.update(id, data);
        const updatedWebsite = response.data.data.website;
        
        set((state) => ({
          websites: state.websites.map((w) =>
            w._id === id ? updatedWebsite : w
          ),
          currentWebsite:
            state.currentWebsite?._id === id
              ? updatedWebsite
              : state.currentWebsite,
          isLoading: false,
        }));

        toast({
          variant: 'success',
          title: 'Website updated',
          description: 'Website has been updated successfully.',
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to update website',
          isLoading: false,
        });
        throw error;
      }
    },

    deleteWebsite: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        await websiteApi.delete(id);
        
        set((state) => ({
          websites: state.websites.filter((w) => w._id !== id),
          currentWebsite:
            state.currentWebsite?._id === id
              ? state.websites.find((w) => w._id !== id) || null
              : state.currentWebsite,
          isLoading: false,
        }));

        toast({
          variant: 'success',
          title: 'Website deleted',
          description: 'Website has been deleted successfully.',
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || 'Failed to delete website',
          isLoading: false,
        });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
  })
);
