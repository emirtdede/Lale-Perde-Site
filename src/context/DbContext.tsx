'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { addProductAction, updateProductAction, deleteProductAction } from '../app/admin/actions/productActions';
import { addCategoryAction, updateCategoryAction, deleteCategoryAction, addCurtainTypeAction, updateCurtainTypeAction, deleteCurtainTypeAction, addFabricTypeAction, updateFabricTypeAction, deleteFabricTypeAction, addMountingTypeAction, updateMountingTypeAction, deleteMountingTypeAction } from '../app/admin/actions/categoryActions';
import { updateSettingsAction, updateHomeContentAction } from '../app/admin/actions/settingsActions';
import { addServiceAction, updateServiceAction, deleteServiceAction, addGuideAction, updateGuideAction, deleteGuideAction, addCampaignAction, updateCampaignAction, deleteCampaignAction, updateInboxMessageAction, addCommentAction, updateCommentAction, deleteCommentAction } from '../app/admin/actions/contentActions';
import {
  Product,
  Category,
  SystemSettings,
  HomePageContent,
  ServiceItem,
  GuideItem,
  Campaign,
  InboxMessage,
  SearchLog,
  VisitorLog,
  CurtainType,
  FabricType,
  MountingType
} from './dbTypes';

interface DbContextType {
  categories: Category[];
  curtainTypes: CurtainType[];
  fabricTypes: FabricType[];
  mountingTypes: MountingType[];
  settings: SystemSettings | null;
  homeContent: HomePageContent | null;
  services: ServiceItem[];
  guides: GuideItem[];
  campaigns: Campaign[];
  inbox: InboxMessage[];
  searchLogs: SearchLog[];
  visitorLogs: VisitorLog[];
  comments: any[];
  loading: boolean;
  
  // Products
  addProduct: (product: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Categories
  addCategory: (category: Category) => Promise<boolean>;
  updateCategory: (category: Category) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Curtain Types
  addCurtainType: (curtainType: Omit<CurtainType, 'id'>) => Promise<boolean>;
  updateCurtainType: (curtainType: CurtainType) => Promise<boolean>;
  deleteCurtainType: (id: string) => Promise<boolean>;
  
  // Fabric Types
  addFabricType: (fabricType: Omit<FabricType, 'id'>) => Promise<boolean>;
  updateFabricType: (fabricType: FabricType) => Promise<boolean>;
  deleteFabricType: (id: string) => Promise<boolean>;
  
  // Mounting Types
  addMountingType: (mountingType: Omit<MountingType, 'id'>) => Promise<boolean>;
  updateMountingType: (mountingType: MountingType) => Promise<boolean>;
  deleteMountingType: (id: string) => Promise<boolean>;
  
  // Settings
  updateSettings: (settings: SystemSettings) => Promise<boolean>;
  
  // Home Content
  updateHomeContent: (content: HomePageContent) => Promise<boolean>;
  
  // Services
  addService: (service: ServiceItem) => Promise<boolean>;
  updateService: (service: ServiceItem) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  
  // Guides
  addGuide: (guide: GuideItem) => Promise<boolean>;
  updateGuide: (guide: GuideItem) => Promise<boolean>;
  deleteGuide: (id: string) => Promise<boolean>;
  
  // Campaigns
  addCampaign: (campaign: Campaign) => Promise<boolean>;
  updateCampaign: (campaign: Campaign) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
  
  // Inbox
  addInboxMessage: (message: Omit<InboxMessage, 'id' | 'date'>) => Promise<boolean>;
  updateInboxMessage: (message: InboxMessage) => Promise<boolean>;
  
  // Search
  incrementSearchLog: (query: string) => Promise<boolean>;
  
  // Visitors
  addVisitorLog: (log: VisitorLog) => Promise<boolean>;
  updateVisitorLogDwellTime: (id: string, duration: number) => Promise<boolean>;

  // Pagination Fetches
  fetchProductsPaginated: (page: number, limit?: number) => Promise<{ data: Product[], count: number }>;
  fetchVisitorLogsPaginated: (page: number, limit?: number) => Promise<{ data: VisitorLog[], count: number }>;
  fetchInboxPaginated: (page: number, limit?: number) => Promise<{ data: InboxMessage[], count: number }>;
  fetchSearchLogsPaginated: (page: number, limit?: number) => Promise<{ data: SearchLog[], count: number }>;
  
  // Lazy Fetches
  fetchServicesLazy?: () => Promise<void>;
  fetchGuidesLazy?: () => Promise<void>;
  fetchCampaignsLazy?: () => Promise<void>;
  fetchCommentsLazy?: () => Promise<void>;
  
  // Comments CRUD
  addComment: (comment: any) => Promise<boolean>;
  updateComment: (comment: any) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

import {
  mapProductFromDb,
  mapProductToDb,
  mapCategoryFromDb,
  mapCategoryToDb,
  mapSettingsFromDb,
  mapSettingsToDb,
  mapHomeContentFromDb,
  mapHomeContentToDb,
  mapServiceFromDb,
  mapServiceToDb,
  mapGuideFromDb,
  mapGuideToDb,
  mapCampaignFromDb,
  mapCampaignToDb,
  mapInboxFromDb,
  mapInboxToDb,
  mapVisitorLogFromDb,
  mapVisitorLogToDb,
  mapCurtainTypeFromDb,
  mapCurtainTypeToDb,
  mapFabricTypeFromDb,
  mapFabricTypeToDb,
  mapMountingTypeFromDb,
  mapMountingTypeToDb,
  mapCommentFromDb,
  mapCommentToDb
} from './dbMappers';

export {
  mapProductFromDb,
  mapProductToDb,
  mapCategoryFromDb,
  mapCategoryToDb,
  mapSettingsFromDb,
  mapSettingsToDb,
  mapHomeContentFromDb,
  mapHomeContentToDb,
  mapServiceFromDb,
  mapServiceToDb,
  mapGuideFromDb,
  mapGuideToDb,
  mapCampaignFromDb,
  mapCampaignToDb,
  mapInboxFromDb,
  mapInboxToDb,
  mapVisitorLogFromDb,
  mapVisitorLogToDb,
  mapCurtainTypeFromDb,
  mapCurtainTypeToDb,
  mapFabricTypeFromDb,
  mapFabricTypeToDb,
  mapMountingTypeFromDb,
  mapMountingTypeToDb
};

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [curtainTypes, setCurtainTypes] = useState<CurtainType[]>([]);
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [mountingTypes, setMountingTypes] = useState<MountingType[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [homeContent, setHomeContent] = useState<HomePageContent | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesFetched, setServicesFetched] = useState(false);
  const [guidesFetched, setGuidesFetched] = useState(false);
  const [campaignsFetched, setCampaignsFetched] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsFetched, setCommentsFetched] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        { data: rawCats },
        { data: rawCurtains },
        { data: rawFabrics },
        { data: rawSettings },
        { data: rawHome },
        { data: rawMountings }
      ] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('curtain_types').select('*').order('display_order', { ascending: true }),
        supabase.from('fabric_types').select('*').order('display_order', { ascending: true }),
        supabase.from('site_settings').select('id, store_name, phone, email, address, whatsapp_number, google_maps_embed, announcement_tr, announcement_en, announcement_active, working_hours_tr, working_hours_en, google_ads_id, ads_label_whatsapp, ads_label_contact, shopier_url, instagram_url, facebook_url, linkedin_url, campaign_interval, logo_config'),
        supabase.from('home_page_content').select('*'),
        supabase.from('mounting_types').select('*').order('display_order', { ascending: true })
      ]);

      if (rawCats) setCategories(rawCats.map(mapCategoryFromDb));
      if (rawCurtains) setCurtainTypes(rawCurtains.map(mapCurtainTypeFromDb));
      if (rawFabrics) setFabricTypes(rawFabrics.map(mapFabricTypeFromDb));
      if (rawMountings) setMountingTypes(rawMountings.map(mapMountingTypeFromDb));
      if (rawSettings && rawSettings[0]) setSettings(mapSettingsFromDb(rawSettings[0]));
      if (rawHome && rawHome[0]) setHomeContent(mapHomeContentFromDb(rawHome[0]));

      // These will be fetched paginated by their respective components
      setInbox([]);
      setSearchLogs([]);
      setVisitorLogs([]);

    } catch (e: any) {
      console.warn('Error fetching data from Supabase:', e.message || e);
    } finally {
      setLoading(false);
    }
  };

  


  useEffect(() => {
    fetchData();
  }, []);

  // LAZY FETCHES
  const fetchServicesLazy = useCallback(async () => {
    if (servicesFetched) return;
    const { data } = await supabase.from('services').select('*');
    if (data) setServices(data.map(mapServiceFromDb));
    setServicesFetched(true);
  }, [servicesFetched]);

  const fetchGuidesLazy = useCallback(async () => {
    if (guidesFetched) return;
    const { data } = await supabase.from('guides').select('*');
    if (data) setGuides(data.map(mapGuideFromDb));
    setGuidesFetched(true);
  }, [guidesFetched]);

  const fetchCampaignsLazy = useCallback(async () => {
    if (campaignsFetched) return;
    const { data } = await supabase.from('campaigns').select('*');
    if (data) setCampaigns(data.map(mapCampaignFromDb).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
    setCampaignsFetched(true);
  }, [campaignsFetched]);

  const fetchCommentsLazy = useCallback(async () => {
    if (commentsFetched) return;
    const { data } = await supabase.from('comments').select('*').order('display_order', { ascending: true });
    if (data) setComments(data.map(mapCommentFromDb));
    setCommentsFetched(true);
  }, [commentsFetched]);

  // PAGINATION FETCHES
  const fetchProductsPaginated = async (page: number, limit: number = 50) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
    if (error) { console.warn('Error fetching products', error); return { data: [], count: 0 }; }
    const mapped = (data || []).map(mapProductFromDb);
    return { data: mapped, count: count || 0 };
  };

  const fetchVisitorLogsPaginated = async (page: number, limit: number = 50) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase.from('visitor_logs').select('*', { count: 'exact' }).range(from, to).order('timestamp', { ascending: false });
    if (error) { console.warn('Error fetching visitor_logs', error); return { data: [], count: 0 }; }
    const mapped = (data || []).map(mapVisitorLogFromDb);
    setVisitorLogs(mapped);
    return { data: mapped, count: count || 0 };
  };

  const fetchInboxPaginated = async (page: number, limit: number = 50) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase.from('inbox').select('*', { count: 'exact' }).range(from, to).order('date', { ascending: false });
    if (error) { console.warn('Error fetching inbox', error.message, error.details); return { data: [], count: 0 }; }
    const mapped = (data || []).map(mapInboxFromDb);
    setInbox(mapped);
    return { data: mapped, count: count || 0 };
  };

  const fetchSearchLogsPaginated = async (page: number, limit: number = 50) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase.from('search_logs').select('*', { count: 'exact' }).range(from, to).order('count', { ascending: false });
    if (error) { console.warn('Error fetching search_logs', error); return { data: [], count: 0 }; }
    setSearchLogs(data || []);
    return { data: data || [], count: count || 0 };
  };

  // PRODUCTS MUTATIONS
  const addProduct = async (p: Omit<Product, 'createdAt' | 'updatedAt'>) => {
    const { error } = await addProductAction(mapProductToDb(p));
    if (error) {
      console.warn('Error adding product', error);
      return false;
    }
    return true;
  };

  const updateProduct = async (p: Product) => {
    const dbData = mapProductToDb(p);
    const { error } = await updateProductAction(p.id, dbData);
    if (error) {
      console.warn('Error updating product', error);
      return false;
    }
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await deleteProductAction(id);
    if (error) {
      console.warn('Error deleting product', error);
      return false;
    }
    return true;
  };

  // CATEGORIES MUTATIONS
  const addCategory = async (c: Category) => {
    const { data, error } = await addCategoryAction(mapCategoryToDb(c));
    if (error) {
      console.warn('Error adding category', error);
      return false;
    }
    if (data && data[0]) {
      setCategories(prev => [...prev, mapCategoryFromDb(data[0])]);
    }
    return true;
  };

  const updateCategory = async (c: Category) => {
    const { data, error } = await updateCategoryAction(c.id, mapCategoryToDb(c));
    if (error) {
      console.warn('Error updating category', error);
      return false;
    }
    if (data && data[0]) {
      setCategories(prev => prev.map(item => item.id === c.id ? mapCategoryFromDb(data[0]) : item));
    }
    return true;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await deleteCategoryAction(id);
    if (error) {
      console.warn('Error deleting category', error);
      return false;
    }
    setCategories(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // CURTAIN TYPES MUTATIONS
  const addCurtainType = async (c: Omit<CurtainType, 'id'>) => {
    const { data, error } = await addCurtainTypeAction(mapCurtainTypeToDb(c as CurtainType));
    if (error) { console.warn('Error adding curtain type', error); return false; }
    if (data && data[0]) setCurtainTypes(prev => [...prev, mapCurtainTypeFromDb(data[0])]);
    return true;
  };

  const updateCurtainType = async (c: CurtainType) => {
    const { data, error } = await updateCurtainTypeAction(c.id, mapCurtainTypeToDb(c));
    if (error) { console.warn('Error updating curtain type', error); return false; }
    if (data && data[0]) setCurtainTypes(prev => prev.map(item => item.id === c.id ? mapCurtainTypeFromDb(data[0]) : item));
    return true;
  };

  const deleteCurtainType = async (id: string) => {
    const { error } = await deleteCurtainTypeAction(id);
    if (error) { console.warn('Error deleting curtain type', error); return false; }
    setCurtainTypes(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // FABRIC TYPES MUTATIONS
  const addFabricType = async (f: Omit<FabricType, 'id'>) => {
    const { data, error } = await addFabricTypeAction(mapFabricTypeToDb(f as FabricType));
    if (error) { console.warn('Error adding fabric type', error); return false; }
    if (data && data[0]) setFabricTypes(prev => [...prev, mapFabricTypeFromDb(data[0])]);
    return true;
  };

  const updateFabricType = async (f: FabricType) => {
    const { data, error } = await updateFabricTypeAction(f.id, mapFabricTypeToDb(f));
    if (error) { console.warn('Error updating fabric type', error); return false; }
    if (data && data[0]) setFabricTypes(prev => prev.map(item => item.id === f.id ? mapFabricTypeFromDb(data[0]) : item));
    return true;
  };

  const deleteFabricType = async (id: string) => {
    const { error } = await deleteFabricTypeAction(id);
    if (error) { console.warn('Error deleting fabric type', error); return false; }
    setFabricTypes(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // MOUNTING TYPES MUTATIONS
  const addMountingType = async (m: Omit<MountingType, 'id'>) => {
    const { data, error } = await addMountingTypeAction(mapMountingTypeToDb(m as MountingType));
    if (error) { console.warn('Error adding mounting type', error); return false; }
    if (data && data[0]) setMountingTypes(prev => [...prev, mapMountingTypeFromDb(data[0])]);
    return true;
  };

  const updateMountingType = async (m: MountingType) => {
    const { data, error } = await updateMountingTypeAction(m.id, mapMountingTypeToDb(m));
    if (error) { console.warn('Error updating mounting type', error); return false; }
    if (data && data[0]) setMountingTypes(prev => prev.map(item => item.id === m.id ? mapMountingTypeFromDb(data[0]) : item));
    return true;
  };

  const deleteMountingType = async (id: string) => {
    const { error } = await deleteMountingTypeAction(id);
    if (error) { console.warn('Error deleting mounting type', error); return false; }
    setMountingTypes(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // SETTINGS MUTATION
  const updateSettings = async (s: SystemSettings) => {
    const { data, error } = await updateSettingsAction(mapSettingsToDb(s));
    if (error) {
      console.warn('Error updating settings', error);
      return false;
    }
    if (data && data[0]) {
      setSettings(mapSettingsFromDb(data[0]));
    }
    return true;
  };

  // HOME CONTENT MUTATION
  const updateHomeContent = async (h: HomePageContent) => {
    const { data, error } = await updateHomeContentAction(mapHomeContentToDb(h));
    if (error) {
      console.warn('Error updating home content', error);
      return false;
    }
    if (data && data[0]) {
      setHomeContent(mapHomeContentFromDb(data[0]));
    }
    return true;
  };

  // SERVICES MUTATIONS
  const addService = async (s: ServiceItem) => {
    const { data, error } = await addServiceAction(mapServiceToDb(s));
    if (error) {
      console.warn('Error adding service', error);
      return false;
    }
    if (data && data[0]) {
      setServices(prev => [...prev, mapServiceFromDb(data[0])]);
    }
    return true;
  };

  const updateService = async (s: ServiceItem) => {
    const { data, error } = await updateServiceAction(s.id, mapServiceToDb(s));
    if (error) {
      console.warn('Error updating service', error);
      return false;
    }
    if (data && data[0]) {
      setServices(prev => prev.map(item => item.id === s.id ? mapServiceFromDb(data[0]) : item));
    }
    return true;
  };

  const deleteService = async (id: string) => {
    const { error } = await deleteServiceAction(id);
    if (error) {
      console.warn('Error deleting service', error);
      return false;
    }
    setServices(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // GUIDES MUTATIONS
  const addGuide = async (g: GuideItem) => {
    const { data, error } = await addGuideAction(mapGuideToDb(g));
    if (error) {
      console.warn('Error adding guide', error);
      return false;
    }
    if (data && data[0]) {
      setGuides(prev => [...prev, mapGuideFromDb(data[0])]);
    }
    return true;
  };

  const updateGuide = async (g: GuideItem) => {
    const { data, error } = await updateGuideAction(g.id, mapGuideToDb(g));
    if (error) {
      console.warn('Error updating guide', error);
      return false;
    }
    if (data && data[0]) {
      setGuides(prev => prev.map(item => item.id === g.id ? mapGuideFromDb(data[0]) : item));
    }
    return true;
  };

  const deleteGuide = async (id: string) => {
    const { error } = await deleteGuideAction(id);
    if (error) {
      console.warn('Error deleting guide', error);
      return false;
    }
    setGuides(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // CAMPAIGNS MUTATIONS
  const addCampaign = async (c: Campaign) => {
    const { data, error } = await addCampaignAction(mapCampaignToDb(c));
    if (error) {
      console.warn('Error adding campaign', error);
      return false;
    }
    if (data && data[0]) {
      setCampaigns(prev => [...prev, mapCampaignFromDb(data[0])].sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
    }
    return true;
  };

  const updateCampaign = async (c: Campaign) => {
    const { data, error } = await updateCampaignAction(c.id, mapCampaignToDb(c));
    if (error) {
      console.warn('Error updating campaign', error);
      return false;
    }
    if (data && data[0]) {
      setCampaigns(prev => prev.map(item => item.id === c.id ? mapCampaignFromDb(data[0]) : item).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
    }
    return true;
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await deleteCampaignAction(id);
    if (error) {
      console.warn('Error deleting campaign', error);
      return false;
    }
    setCampaigns(prev => prev.filter(item => item.id !== id).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
    return true;
  };

  // COMMENTS MUTATIONS
  const addComment = async (c: any) => {
    const { data, error } = await addCommentAction(mapCommentToDb(c));
    if (error) { console.warn('Error adding comment', error); return false; }
    if (data && data[0]) {
      setComments(prev => [...prev, mapCommentFromDb(data[0])].sort((a, b) => a.displayOrder - b.displayOrder));
    }
    return true;
  };

  const updateComment = async (c: any) => {
    const { data, error } = await updateCommentAction(c.id, mapCommentToDb(c));
    if (error) { console.warn('Error updating comment', error); return false; }
    if (data && data[0]) {
      setComments(prev => prev.map(item => item.id === c.id ? mapCommentFromDb(data[0]) : item).sort((a, b) => a.displayOrder - b.displayOrder));
    }
    return true;
  };

  const deleteComment = async (id: string) => {
    const { error } = await deleteCommentAction(id);
    if (error) { console.warn('Error deleting comment', error); return false; }
    setComments(prev => prev.filter(item => item.id !== id).sort((a, b) => a.displayOrder - b.displayOrder));
    return true;
  };

  // INBOX MUTATIONS
  const addInboxMessage = async (m: Omit<InboxMessage, 'id' | 'date'>) => {
    const id = `msg-${Date.now()}`;
    const insertData = mapInboxToDb({ ...m, id });
    const { data, error } = await supabase.from('inbox').insert([insertData]).select();
    if (error) {
      console.warn('Error adding inbox message', error);
      return false;
    }
    if (data && data[0]) {
      setInbox(prev => [mapInboxFromDb(data[0]), ...prev]);
    }
    return true;
  };

  const updateInboxMessage = async (m: InboxMessage) => {
    const { data, error } = await updateInboxMessageAction(m.id, mapInboxToDb(m));
    if (error) {
      console.warn('Error updating inbox message', error);
      return false;
    }
    if (data && data[0]) {
      setInbox(prev => prev.map(item => item.id === m.id ? mapInboxFromDb(data[0]) : item));
    }
    return true;
  };

  // SEARCH LOGS MUTATIONS
  const incrementSearchLog = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return false;

    try {
      const response = await fetch('/api/public/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', data: { query: trimmed } })
      });
      const result = await response.json();
      if (response.ok && result.data && result.data[0]) {
        setSearchLogs(prev => {
          const exists = prev.find(item => item.query === trimmed);
          if (exists) return prev.map(item => item.query === trimmed ? result.data[0] : item);
          return [...prev, result.data[0]];
        });
        return true;
      }
    } catch (e) {
      console.warn('Error logging search', e);
    }
    return false;
  };

  // VISITOR LOGS MUTATIONS
  const addVisitorLog = useCallback(async (log: VisitorLog) => {
    const insertData = mapVisitorLogToDb(log);
    try {
      const response = await fetch('/api/public/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visitor', data: insertData })
      });
      const result = await response.json();
      if (response.ok && result.data && result.data[0]) {
        setVisitorLogs(prev => [mapVisitorLogFromDb(result.data[0]), ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('Error inserting visitor log', e);
    }
    return false;
  }, []);

  const updateVisitorLogDwellTime = useCallback(async (id: string, duration: number) => {
    try {
      const response = await fetch('/api/public/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visitor_duration', id, data: { duration } })
      });
      if (response.ok) {
        setVisitorLogs(prev => prev.map(item => item.id === id ? { ...item, duration } : item));
        return true;
      }
    } catch (e) {
      console.warn('Error updating visitor log duration', e);
    }
    return false;
  }, []);

  const contextValue = useMemo(() => ({
    categories,
    curtainTypes,
    fabricTypes,
    mountingTypes,
    settings,
    homeContent,
    services,
    guides,
    campaigns,
    inbox,
    searchLogs,
    visitorLogs,
    loading,
    
    addProduct,
    updateProduct,
    deleteProduct,
    
    addCategory,
    updateCategory,
    deleteCategory,
    
    addCurtainType,
    updateCurtainType,
    deleteCurtainType,
    
    addFabricType,
    updateFabricType,
    deleteFabricType,

    addMountingType,
    updateMountingType,
    deleteMountingType,
    
    updateSettings,
    updateHomeContent,
    
    addService,
    updateService,
    deleteService,
    
    addGuide,
    updateGuide,
    deleteGuide,
    
    addCampaign,
    updateCampaign,
    deleteCampaign,
    
    addInboxMessage,
    updateInboxMessage,
    
    incrementSearchLog,
    
    addVisitorLog,
    updateVisitorLogDwellTime,

    fetchProductsPaginated,
    fetchVisitorLogsPaginated,
    fetchInboxPaginated,
    fetchSearchLogsPaginated,
    
    fetchServicesLazy,
    fetchGuidesLazy,
    fetchCampaignsLazy,
    fetchCommentsLazy,
    comments,
    addComment,
    updateComment,
    deleteComment
  }), [
    categories, curtainTypes, fabricTypes, mountingTypes, settings, homeContent, 
    services, guides, campaigns, inbox, searchLogs, visitorLogs, loading, comments
  ]);

  return (
    <DbContext.Provider value={contextValue}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
