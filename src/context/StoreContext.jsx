import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_CATEGORIES as MOCK_CATEGORIES, 
  INITIAL_PRODUCTS as MOCK_PRODUCTS, 
  INITIAL_ORDERS as MOCK_ORDERS 
} from '../data/mockStoreData';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export function StoreProvider({ children }) {
  const { setCurrentUser, refetchNeon } = useAuth();

  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [allocations, setAllocations] = useState({});

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_cart_inr');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Fetch from Neon PostgreSQL
  const fetchNeonData = async () => {
    try {
      const [catRes, prodRes, ordRes, allocRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/allocations`).catch(() => ({ ok: false }))
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData) && catData.length > 0) setCategories(catData);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) setProducts(prodData);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        if (Array.isArray(ordData)) setOrders(ordData);
      }
      if (allocRes && allocRes.ok) {
        const allocData = await allocRes.json();
        if (Array.isArray(allocData)) setAllocations(allocData);
      }
    } catch (e) {
      console.warn('Backend fetch fallback to local:', e.message);
    }
  };

  useEffect(() => {
    fetchNeonData();
  }, []);

  useEffect(() => {
    localStorage.setItem('vortex_cart_inr', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  // Category CRUD with Neon PostgreSQL
  const addCategory = async (categoryData) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [created, ...prev]);
        return created;
      }
    } catch (e) {
      console.warn('Neon category creation fallback:', e.message);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {}
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = async (id) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product CRUD with Neon PostgreSQL
  const addProduct = async (productData) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        fetchNeonData();
        return;
      }
    } catch (e) {
      console.warn('Neon product add fallback:', e.message);
    }
    setProducts(prev => [productData, ...prev]);
  };

  const updateProduct = async (id, updates) => {
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchNeonData();
    } catch (e) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Place Order & Checkout with Neon PostgreSQL
  const placeOrder = async (orderForm) => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const cleanPin = orderForm.pinCode ? orderForm.pinCode.toString().trim() : '';
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new Error('Please enter a valid 6-digit Indian PIN code (e.g. 400051).');
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const items = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      billingCycle: item.product.billingCycle
    }));

    const payload = {
      ...orderForm,
      pinCode: cleanPin,
      items,
      totalAmount
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        fetchNeonData();
        if (refetchNeon) refetchNeon();
        return { order: data.order, managerUser: data.managerUser };
      }
      throw new Error(data.error || 'Failed to create order in Neon');
    } catch (e) {
      throw e;
    }
  };

  const updateOrderStatus = async (orderId, updates) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchNeonData();
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
  };

  // Fetch allocations for a company from Neon
  const fetchCompanyAllocations = async (companyId) => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API_URL}/allocations/${companyId}`);
      if (res.ok) {
        const rows = await res.json();
        // Convert rows to { [productId]: { assignedUserIds: [] } }
        const map = {};
        rows.forEach(r => {
          const pId = r.product_id || r.productId;
          const uId = r.user_id || r.userId;
          if (!map[pId]) map[pId] = { assignedUserIds: [] };
          if (!map[pId].assignedUserIds.includes(uId)) {
            map[pId].assignedUserIds.push(uId);
          }
        });
        setAllocations(prev => {
          const prevRaw = (Array.isArray(prev?._rawList) ? prev._rawList : []).filter(a => 
            !(a.companyId === companyId || a.company_id === companyId)
          );
          return {
            ...prev,
            [companyId]: map,
            _rawList: [...prevRaw, ...rows]
          };
        });
      }
    } catch (e) {
      console.warn('Neon allocations fetch fallback:', e.message);
    }
  };

  const assignProductSeat = async (companyId, productId, userId) => {
    const prodObj = products.find(p => p.id === productId);
    // Optimistic UI update
    setAllocations(prev => {
      const companyMap = prev[companyId] || {};
      const prodMap = companyMap[productId] || { assignedUserIds: [] };
      const currentUsers = prodMap.assignedUserIds || [];
      const updatedUsers = currentUsers.includes(userId) ? currentUsers : [...currentUsers, userId];

      const prevRaw = Array.isArray(prev?._rawList) ? prev._rawList : [];
      const newRaw = [
        ...prevRaw.filter(a => !((a.companyId === companyId || a.company_id === companyId) && (a.productId === productId || a.product_id === productId) && (a.userId === userId || a.user_id === userId))),
        { 
          companyId, 
          company_id: companyId, 
          productId, 
          product_id: productId, 
          userId, 
          user_id: userId,
          productName: prodObj?.name || productId,
          product_name: prodObj?.name || productId
        }
      ];

      return {
        ...prev,
        [companyId]: {
          ...companyMap,
          [productId]: {
            assignedUserIds: updatedUsers
          }
        },
        _rawList: newRaw
      };
    });

    try {
      const res = await fetch(`${API_URL}/allocations/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, productId, userId })
      });
      const data = await res.json();
      await fetchCompanyAllocations(companyId);
      return data;
    } catch (e) {
      console.warn('Neon seat assignment error:', e.message);
      return { success: false, error: e.message };
    }
  };

  const revokeProductSeat = async (companyId, productId, userId) => {
    // Optimistic UI update
    setAllocations(prev => {
      const companyMap = prev[companyId] || {};
      const prodMap = companyMap[productId] || { assignedUserIds: [] };
      const updatedUsers = (prodMap.assignedUserIds || []).filter(id => id !== userId);

      const prevRaw = Array.isArray(prev?._rawList) ? prev._rawList : [];
      const newRaw = prevRaw.filter(a => 
        !((a.companyId === companyId || a.company_id === companyId) && (a.productId === productId || a.product_id === productId) && (a.userId === userId || a.user_id === userId))
      );

      return {
        ...prev,
        [companyId]: {
          ...companyMap,
          [productId]: {
            assignedUserIds: updatedUsers
          }
        },
        _rawList: newRaw
      };
    });

    try {
      const res = await fetch(`${API_URL}/allocations/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, productId, userId })
      });
      const data = await res.json();
      await fetchCompanyAllocations(companyId);
      return data;
    } catch (e) {
      console.warn('Neon seat revocation error:', e.message);
      return { success: false, error: e.message };
    }
  };

  // Invite team member via Neon backend
  const inviteTeamMember = async ({ companyId, companyName, name, email, role, tempPassword }) => {
    try {
      const res = await fetch(`${API_URL}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, companyName, name, email, role, tempPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (refetchNeon) refetchNeon();
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Failed to invite team member.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        orders,
        allocations,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        placeOrder,
        updateOrderStatus,
        assignProductSeat,
        revokeProductSeat,
        fetchCompanyAllocations,
        inviteTeamMember,
        refreshNeon: fetchNeonData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
