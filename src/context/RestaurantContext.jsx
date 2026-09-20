import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [outlet, setOutlet] = useState(null);
  const [table, setTable] = useState(null);
  const [tableToken, setTableToken] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse path for /c/:outletCode/:tableToken or /c/:outletCode
  const parseUrlParams = useCallback(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/c\/([^/]+)(?:\/([^/]+))?/i);
    if (match) {
      const outletCode = match[1];
      const token = match[2] || null;
      return { outletCode, token };
    }
    // Check search params fallback (e.g. ?outlet=uf-01&table=token)
    const searchParams = new URLSearchParams(window.location.search);
    const outletParam = searchParams.get('outlet') || searchParams.get('outletCode');
    const tokenParam = searchParams.get('token') || searchParams.get('tableToken');
    if (outletParam) {
      return { outletCode: outletParam, token: tokenParam };
    }
    return null;
  }, []);

  // 1. Resolve Table QR or Load Default Outlet
  const loadRestaurantData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const urlContext = parseUrlParams();
      const savedToken = sessionStorage.getItem('customer_table_token');
      const savedOutletCode = sessionStorage.getItem('customer_outlet_code');

      const activeOutletCode = urlContext?.outletCode || savedOutletCode;
      const activeTableToken = urlContext?.token || savedToken;

      // Case A: Table QR token is present
      if (activeOutletCode && activeTableToken) {
        const { data, error: rpcError } = await supabase.rpc('resolve_table_qr', {
          p_outlet_code: activeOutletCode,
          p_table_token: activeTableToken,
        });

        if (!rpcError && data?.success) {
          setOutlet(data.outlet);
          setTable(data.table);
          setTableToken(data.table_token);
          sessionStorage.setItem('customer_table_token', data.table_token);
          sessionStorage.setItem('customer_outlet_code', data.outlet.code);

          // Fetch active offers for this outlet
          if (data.outlet?.id) {
            fetchOffers(data.outlet.id);
          }
          setLoading(false);
          return;
        }
      }

      // Case B: Outlet code only (Takeaway / Direct Menu - e.g. /c/:outletCode)
      if (activeOutletCode) {
        const { data: outletRes, error: oError } = await supabase.rpc('get_public_website_outlet', {
          p_outlet_code: activeOutletCode,
        });

        if (!oError && outletRes?.success && outletRes.outlet) {
          const formattedOutlet = outletRes.outlet;
          setOutlet(formattedOutlet);
          setTable(null);
          setTableToken(null);
          sessionStorage.setItem('customer_outlet_code', formattedOutlet.code);
          sessionStorage.removeItem('customer_table_token');
          fetchOffers(formattedOutlet.id);
          setLoading(false);
          return;
        }
      }

      // Case C: Standalone Root Website (e.g. /) -> Resolve primary website outlet
      const { data: rootRes, error: rError } = await supabase.rpc('get_public_website_outlet', {});

      if (!rError && rootRes?.success && rootRes.outlet) {
        const formattedOutlet = rootRes.outlet;
        setOutlet(formattedOutlet);
        setTable(null);
        setTableToken(null);
        sessionStorage.setItem('customer_outlet_code', formattedOutlet.code);
        sessionStorage.removeItem('customer_table_token');
        fetchOffers(formattedOutlet.id);
      } else {
        setError(rootRes?.error || rError?.message || 'Failed to resolve restaurant outlet');
      }
    } catch (err) {
      console.warn('Error loading restaurant context:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [parseUrlParams]);

  // Fetch active promotional offers from Supabase
  const fetchOffers = async (outletId) => {
    try {
      const { data, error: offersErr } = await supabase.rpc('get_customer_offers', {
        p_outlet_id: outletId,
      });

      if (!offersErr && data?.success) {
        setOffers(data.offers || []);
      } else {
        // Direct table fallback
        const { data: directOffers } = await supabase
          .from('offers_coupons')
          .select('id, code, title, description, discount_type, discount_value, max_discount_amount, min_order_subtotal, valid_from, valid_until, is_active')
          .eq('is_active', true)
          .or(`outlet_id.eq.${outletId},outlet_id.is.null`);
        setOffers(directOffers || []);
      }
    } catch (err) {
      console.warn('Failed to fetch offers:', err);
      setOffers([]);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  // Format brand values
  const restaurantName = useMemo(() => {
    return outlet?.organization_name || outlet?.name || 'Restaurant';
  }, [outlet]);

  const outletName = useMemo(() => {
    return outlet?.name || '';
  }, [outlet]);

  const formattedAddress = useMemo(() => {
    if (!outlet?.address) return '';
    if (typeof outlet.address === 'string') return outlet.address;
    const addr = outlet.address;
    const parts = [addr.street, addr.area, addr.landmark, addr.city, addr.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '';
  }, [outlet]);

  const cleanPhone = useMemo(() => {
    if (!outlet?.phone) return '';
    return outlet.phone.replace(/[^0-9]/g, '');
  }, [outlet]);

  const value = {
    outlet,
    outletId: outlet?.id || null,
    outletCode: outlet?.code || null,
    table,
    tableToken,
    isTableSession: Boolean(table && tableToken),
    restaurantName,
    outletName,
    formattedAddress,
    phone: outlet?.phone || '',
    cleanPhone,
    socialLinks: outlet?.social_links || {},
    logoUrl: outlet?.logo_url || null,
    offers,
    loading,
    error,
    refreshRestaurant: loadRestaurantData,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
