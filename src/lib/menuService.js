import { supabase } from './supabase';

const DEFAULT_CATEGORY_IMAGES = {
  'Starters': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80',
  'Fruit Juices': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&q=80',
  'Special Juices': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80',
  'Dry Fruit Juices': 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=300&q=80',
  'Vegetable Juices': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300&q=80',
  'Fruit Salads': 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=300&q=80',
  'Milk Shakes': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
  'Summer Specials': 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=300&q=80',
  'Punch & Shots': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&q=80',
  'Biryani & Rice': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
  'Curries & Gravies': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80',
  'Breads & Naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80'
};

export async function fetchLiveMenu(outletId = null) {
  try {
    const { data, error } = await supabase.rpc('get_customer_menu', {
      p_outlet_id: outletId
    });

    if (error) {
      console.error('Failed to fetch live customer menu:', error);
      return { success: false, categories: [], items: [], categorized: {}, error: error.message };
    }

    const categories = data.categories || [];
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const items = (data.items || []).map(item => {
      const catName = categoryMap.get(item.category_id) || 'Specials';
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.base_price) || 0,
        base_price: Number(item.base_price) || 0,
        image: item.image_url || DEFAULT_CATEGORY_IMAGES[catName] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
        category_id: item.category_id,
        category: catName,
        is_available: item.is_available !== false,
        variants: item.variants || [],
        modifiers: item.modifiers || [],
        rating: 4.8,
        reviews: Math.floor(Math.random() * 40 + 20),
        badge: item.is_available === false ? 'Sold Out' : (item.name.toLowerCase().includes('special') ? 'Special' : (item.name.toLowerCase().includes('royal') ? 'Royal' : 'Popular'))
      };
    });

    // Group items by category name
    const categorized = {};
    for (const cat of categories) {
      categorized[cat.name] = items.filter(i => i.category_id === cat.id);
    }

    return {
      success: true,
      outlet_id: data.outlet_id,
      categories,
      items,
      categorized,
      tax: data.tax
    };
  } catch (err) {
    console.error('Error in fetchLiveMenu:', err);
    return { success: false, categories: [], items: [], categorized: {}, error: err.message };
  }
}

export function subscribeToLiveMenu(onUpdate) {
  const channel = supabase
    .channel('customer_menu_live_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
