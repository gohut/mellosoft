"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_PRODUCTS } from "../../data/products";
import { MOCK_CATEGORIES, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_WISHLISTS, MOCK_CARTS, MOCK_REVIEWS, MOCK_BANNERS } from "../data/adminMockData";
import { DEFAULT_ROLES } from "../../data/rolesData";
import { DEFAULT_USERS } from "../../data/usersData";
import { hashPassword, checkPermission } from "../../utils/security";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminContext = createContext();

const PRODUCTS_STORAGE_KEY = "mellosoft_products";
const CATEGORIES_STORAGE_KEY = "mellosoft_categories";
const USERS_STORAGE_KEY = "mellosoft_users";
const ROLES_STORAGE_KEY = "mellosoft_roles";
const ORDERS_STORAGE_KEY = "mellosoft_orders";
const CUSTOMERS_STORAGE_KEY = "mellosoft_customers";
const WISHLISTS_STORAGE_KEY = "mellosoft_wishlists";
const CARTS_STORAGE_KEY = "mellosoft_admin_carts";
const REVIEWS_STORAGE_KEY = "mellosoft_reviews";
const BANNERS_STORAGE_KEY = "mellosoft_banners";

export function AdminProvider({ children }) {
  const [adminView, setAdminView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  // Hydrate products from localStorage if available, or default to MOCK_PRODUCTS
  const [products, setProducts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load products from localStorage:", e);
      }
    }
    return MOCK_PRODUCTS;
  });

  // Hydrate categories from localStorage if available, or default to MOCK_CATEGORIES
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load categories from localStorage:", e);
      }
    }
    return MOCK_CATEGORIES;
  });

  const [roles, setRoles] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ROLES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const systemRoles = DEFAULT_ROLES.map((dr) => {
              const found = parsed.find((r) => r.id === dr.id);
              return found ? { ...dr, ...found, permissions: found.permissions || dr.permissions } : dr;
            });
            const customRoles = parsed.filter((r) => !r.isSystemRole && !DEFAULT_ROLES.some((dr) => dr.id === r.id));
            return [...systemRoles, ...customRoles];
          }
        }
      } catch (e) {
        console.error("Failed to load roles from localStorage:", e);
      }
    }
    return DEFAULT_ROLES;
  });

  // Hydrate users from localStorage
  const [users, setUsers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(USERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load users from localStorage:", e);
      }
    }
    return DEFAULT_USERS;
  });

  // Hydrate orders from localStorage
  const [orders, setOrders] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    }
    return MOCK_ORDERS;
  });

  // Hydrate customers from localStorage
  const [customers, setCustomers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load customers from localStorage:", e);
      }
    }
    return MOCK_CUSTOMERS;
  });

  // Hydrate wishlists from localStorage
  const [wishlists, setWishlists] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(WISHLISTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load wishlists from localStorage:", e);
      }
    }
    return MOCK_WISHLISTS;
  });

  // Hydrate customer carts from localStorage
  const [carts, setCarts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CARTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load customer carts from localStorage:", e);
      }
    }
    return MOCK_CARTS;
  });

  // Hydrate reviews from localStorage
  const [reviews, setReviews] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load reviews from localStorage:", e);
      }
    }
    return MOCK_REVIEWS;
  });

  // Hydrate promotional banners from localStorage
  const [banners, setBanners] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load banners from localStorage:", e);
      }
    }
    return MOCK_BANNERS;
  });

  // Persist banners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    } catch (e) {
      console.error("Failed to save banners to localStorage:", e);
    }
  }, [banners]);

  const auth = useAdminAuth();
  const currentUserId = auth?.currentUserId || (typeof window !== "undefined" ? localStorage.getItem("mellosoft_current_user_id") : null) || "user-001";
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentUserRole = roles.find((r) => r.id === currentUser?.roleId) || roles[0];

  const [notifications] = useState([
    { id: 1, text: "New order #MS-92841 received", time: "2 min ago", read: false },
    { id: 2, text: "Low stock alert: Luxury Down Pillow", time: "15 min ago", read: false },
    { id: 3, text: "New review on Classic Mattress", time: "1 hr ago", read: true },
    { id: 4, text: "Coupon SUMMER30 expires tomorrow", time: "3 hrs ago", read: true },
  ]);

  // Persist products to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } catch (e) {
        console.error("Failed to save products to localStorage:", e);
      }
    }
  }, [products]);

  // Persist categories to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      } catch (e) {
        console.error("Failed to save categories to localStorage:", e);
      }
    }
  }, [categories]);

  // Persist roles to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
      } catch (e) {
        console.error("Failed to save roles to localStorage:", e);
      }
    }
  }, [roles]);

  // Persist users to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (e) {
        console.error("Failed to save users to localStorage:", e);
      }
    }
  }, [users]);

  // Persist orders to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      } catch (e) {
        console.error("Failed to save orders to localStorage:", e);
      }
    }
  }, [orders]);

  // Persist customers to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
      } catch (e) {
        console.error("Failed to save customers to localStorage:", e);
      }
    }
  }, [customers]);

  // Persist wishlists to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
      } catch (e) {
        console.error("Failed to save wishlists to localStorage:", e);
      }
    }
  }, [wishlists]);

  // Persist customer carts to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts));
      } catch (e) {
        console.error("Failed to save customer carts to localStorage:", e);
      }
    }
  }, [carts]);

  // Persist reviews to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
      } catch (e) {
        console.error("Failed to save reviews to localStorage:", e);
      }
    }
  }, [reviews]);

  /** Review Handlers */
  const approveReview = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "Approved" } : r))
    );
  }, []);

  const rejectReview = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "Rejected" } : r))
    );
  }, []);

  const deleteReview = useCallback((reviewId) => {
    const deletedDate = new Date().toISOString().split("T")[0];
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: "Deleted",
              previousStatus: r.status !== "Deleted" ? r.status : r.previousStatus || "Approved",
              deletedAt: deletedDate,
            }
          : r
      )
    );
  }, []);

  const restoreReview = useCallback((reviewId, targetStatus) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const restoredStatus = targetStatus || r.previousStatus || "Approved";
          return {
            ...r,
            status: restoredStatus,
          };
        }
        return r;
      })
    );
  }, []);

  /** Customer Handlers */
  const updateCustomerStatus = useCallback((customerId, status) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status } : c))
    );
  }, []);

  /** Order Handlers */
  const updateOrder = useCallback(
    (orderId, updatedFields) => {
      let updatedOrderObj = null;
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            updatedOrderObj = { ...o, ...updatedFields };
            return updatedOrderObj;
          }
          return o;
        })
      );

      // Sync with backend API
      try {
        fetch(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUserId,
          },
          body: JSON.stringify(updatedFields),
        }).catch((err) => console.warn("Background API order sync warning:", err));
      } catch {
        // Ignore
      }

      return { success: true, order: updatedOrderObj };
    },
    [currentUserId]
  );

  // Check if current user has permission
  const hasPermission = useCallback(
    (moduleName, action) => {
      if (!currentUserRole) return false;
      return checkPermission(currentUserRole, moduleName, action);
    },
    [currentUserRole]
  );

  // navigateTo supports optional itemId for product/user/role views
  const navigateTo = useCallback((view, itemId) => {
    setAdminView(view);
    if (itemId !== undefined) {
      if (view === "product-details" || view === "edit-product") {
        setSelectedProductId(itemId);
      } else if (view === "user-details" || view === "edit-user") {
        setSelectedUserId(itemId);
      } else if (view === "role-details" || view === "edit-role") {
        setSelectedRoleId(itemId);
      }
    }
    setSidebarMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setSidebarMobileOpen((prev) => !prev);
  }, []);

  /** Product Handlers */
  const addProduct = useCallback((newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id || p.Product_Id === updatedProduct.Product_Id ? updatedProduct : p
      )
    );
  }, []);

  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId && p.Product_Id !== productId));
  }, []);

  /** Category Handlers */
  const addCategory = useCallback((newCatData) => {
    const slug = newCatData.slug || newCatData.name.toLowerCase().replace(/\s+/g, "-");
    const newCategory = {
      id: newCatData.id || `CAT${Date.now()}`,
      name: newCatData.name,
      slug,
      image: newCatData.image || "/asset/texture.png",
      description: newCatData.description || `${newCatData.name} category`,
    };
    setCategories((prev) => [newCategory, ...prev]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((catId, updatedData) => {
    setCategories((prev) => {
      const oldCat = prev.find((c) => c.id === catId);
      const newSlug = updatedData.name ? updatedData.name.toLowerCase().replace(/\s+/g, "-") : oldCat?.slug;
      
      if (oldCat && updatedData.name && oldCat.name !== updatedData.name) {
        const oldSlug = oldCat.slug || oldCat.name.toLowerCase();
        setProducts((prevProds) =>
          prevProds.map((p) =>
            (p.category || "").toLowerCase() === oldSlug ? { ...p, category: newSlug } : p
          )
        );
      }

      return prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              name: updatedData.name || c.name,
              slug: newSlug || c.slug,
              image: updatedData.image || c.image,
              description: updatedData.description || c.description,
            }
          : c
      );
    });
  }, []);

  const deleteCategory = useCallback(
    (catId) => {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return { success: false, error: "Category not found." };

      const catSlug = (cat.slug || cat.name || "").toLowerCase();
      const catName = (cat.name || "").toLowerCase();

      const assignedProducts = products.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        return (
          pCat === catSlug ||
          pCat === catName ||
          pCat + "s" === catName ||
          pCat === catName.replace(/s$/, "")
        );
      });

      if (assignedProducts.length > 0) {
        return {
          success: false,
          error: `Cannot delete "${cat.name}" category because ${assignedProducts.length} product${assignedProducts.length > 1 ? "s are" : " is"} assigned to it.`,
        };
      }

      setCategories((prev) => prev.filter((c) => c.id !== catId));
      return { success: true };
    },
    [categories, products]
  );

  /** User Handlers */
  const addUser = useCallback((userData) => {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || "",
      passwordHash: hashPassword(userData.password),
      roleId: userData.roleId,
      status: userData.status || "Active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    return { success: true, user: newUser };
  }, []);

  const updateUser = useCallback((userId, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            name: updatedData.name !== undefined ? updatedData.name : u.name,
            email: updatedData.email !== undefined ? updatedData.email.toLowerCase().trim() : u.email,
            phone: updatedData.phone !== undefined ? updatedData.phone : u.phone,
            roleId: updatedData.roleId !== undefined ? updatedData.roleId : u.roleId,
            status: updatedData.status !== undefined ? updatedData.status : u.status,
          };
          if (updatedData.password) {
            updated.passwordHash = hashPassword(updatedData.password);
          }
          return updated;
        }
        return u;
      })
    );
    return { success: true };
  }, []);

  const toggleUserStatus = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
  }, []);

  const deleteUser = useCallback(
    (userId) => {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return { success: false, error: "User not found." };

      if (userId === currentUserId) {
        return { success: false, error: "You cannot delete your own account." };
      }

      if (targetUser.roleId === "role-super-admin") {
        const superAdminCount = users.filter((u) => u.roleId === "role-super-admin").length;
        if (superAdminCount <= 1) {
          return { success: false, error: "Cannot delete the last Super Admin account." };
        }
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { success: true };
    },
    [users, currentUserId]
  );

  /** Role Handlers */
  const addRole = useCallback((roleData) => {
    const newRole = {
      id: roleData.id || `role-${Date.now()}`,
      name: roleData.name,
      description: roleData.description || `${roleData.name} custom role`,
      isSystemRole: false,
      createdAt: new Date().toISOString().split("T")[0],
      permissions: roleData.permissions || {
        dashboard: ["view"],
        products: ["view"],
        orders: ["view"],
        customers: ["view"],
        reviews: ["view"],
        users: [],
        roles: [],
        settings: [],
      },
    };
    setRoles((prev) => [...prev, newRole]);
    return { success: true, role: newRole };
  }, []);

  const updateRole = useCallback((roleId, updatedData) => {
    let updatedRoleObj = null;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          updatedRoleObj = {
            ...r,
            name: r.isSystemRole ? r.name : updatedData.name || r.name,
            description: updatedData.description !== undefined ? updatedData.description : r.description,
            permissions: updatedData.permissions || r.permissions,
          };
          return updatedRoleObj;
        }
        return r;
      })
    );

    // Sync with backend API
    try {
      fetch(`/api/admin/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(updatedData),
      }).catch((err) => console.warn("Background API role sync warning:", err));
    } catch {
      // Ignore client offline
    }

    return { success: true, role: updatedRoleObj };
  }, [currentUserId]);

  const deleteRole = useCallback(
    (roleId) => {
      const role = roles.find((r) => r.id === roleId);
      if (!role) return { success: false, error: "Role not found." };

      if (role.isSystemRole) {
        return { success: false, error: "System default roles cannot be deleted." };
      }

      const assignedUsers = users.filter((u) => u.roleId === roleId);
      if (assignedUsers.length > 0) {
        return {
          success: false,
          error: `Cannot delete role "${role.name}" because ${assignedUsers.length} user${assignedUsers.length > 1 ? "s are" : " is"} currently assigned to it.`,
        };
      }

      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      return { success: true };
    },
    [roles, users]
  );

  const addBanner = useCallback((bannerData) => {
    const newBanner = {
      id: `banner-${Date.now().toString().slice(-4)}`,
      title: bannerData.title || "Untitled Banner",
      type: bannerData.type || "Offer",
      image: bannerData.image || "/asset/img2.jpg",
      subtitle: bannerData.subtitle || "",
      description: bannerData.description || "",
      ctaText: bannerData.ctaText || "Shop Now",
      ctaLink: bannerData.ctaLink || "mattress",
      isActive: bannerData.isActive !== false,
      displayOrder: Number(bannerData.displayOrder) || (banners.length + 1)
    };
    setBanners((prev) => [...prev, newBanner]);
    return { success: true, banner: newBanner };
  }, [banners.length]);

  const updateBanner = useCallback((id, updatedFields) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
    return { success: true };
  }, []);

  const deleteBanner = useCallback((id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    return { success: true };
  }, []);

  const toggleBannerStatus = useCallback((id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    return { success: true };
  }, []);

  return (
    <AdminContext.Provider
      value={{
        adminView,
        navigateTo,
        sidebarCollapsed,
        toggleSidebar,
        sidebarMobileOpen,
        toggleMobileSidebar,
        notifications,
        selectedProductId,
        selectedUserId,
        selectedRoleId,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        roles,
        addRole,
        updateRole,
        deleteRole,
        orders,
        updateOrder,
        customers,
        updateCustomerStatus,
        wishlists,
        carts,
        reviews,
        approveReview,
        rejectReview,
        deleteReview,
        restoreReview,
        currentUser,
        currentUserRole,
        hasPermission,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}



