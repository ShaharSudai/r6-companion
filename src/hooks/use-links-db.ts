import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoLink {
  id: string;
  headline: string;
  url: string;
  addedAt: number;
}

const STORAGE_KEY = '@R6_Companion_Video_Links';

export function useLinksDb() {
  const [links, setLinks] = useState<Record<string, VideoLink[]>>({});
  const [loading, setLoading] = useState(true);

  // Load links from storage on mount
  useEffect(() => {
    async function loadLinks() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLinks(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load links from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  // Save links to storage helper
  const saveLinks = async (newLinks: Record<string, VideoLink[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
      setLinks(newLinks);
    } catch (error) {
      console.error('Failed to save links to AsyncStorage:', error);
    }
  };

  // Get links for a specific map and operator
  const getLinks = (mapId: string, operatorId: string): VideoLink[] => {
    const key = `${mapId}_${operatorId}`;
    return links[key] || [];
  };

  // Add a new link
  const addLink = async (mapId: string, operatorId: string, headline: string, url: string) => {
    const key = `${mapId}_${operatorId}`;
    const newLink: VideoLink = {
      id: Date.now().toString(),
      headline: headline.trim(),
      url: url.trim(),
      addedAt: Date.now(),
    };

    const currentList = links[key] || [];
    const updatedLinks = {
      ...links,
      [key]: [...currentList, newLink],
    };

    await saveLinks(updatedLinks);
  };

  // Delete a link
  const deleteLink = async (mapId: string, operatorId: string, linkId: string) => {
    const key = `${mapId}_${operatorId}`;
    const currentList = links[key] || [];
    const updatedList = currentList.filter((link) => link.id !== linkId);
    
    const updatedLinks = { ...links };
    if (updatedList.length === 0) {
      delete updatedLinks[key];
    } else {
      updatedLinks[key] = updatedList;
    }

    await saveLinks(updatedLinks);
  };

  return {
    links,
    loading,
    getLinks,
    addLink,
    deleteLink,
  };
}
