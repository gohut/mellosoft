"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import {
  Users as UsersIcon, Shield, Search, Plus, Eye, Pencil, Trash2,
  X, Check, Lock, Power, UserCheck, Key, AlertTriangle, ShieldCheck
} from "lucide-react";

const ALL_MODULES = [
  { id: "dashboard", label: "Dashboard", actions: [{ id: "view", label: "View" }] },
  {
    id: "products",
    label: "Products",
    actions: [
      { id: "view", label: "View" },
      { id: "create", label: "Create" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    actions: [
      { id: "view", label: "View" },
      { id: "update", label: "Update Status" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    actions: [
      { id: "view", label: "View" },
      { id: "create", label: "Create" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    actions: [
      { id: "view", label: "View" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "users",
    label: "Users",
    actions: [
      { id: "view", label: "View" },
      { id: "create", label: "Create" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "roles",
    label: "Roles",
    actions: [
      { id: "view", label: "View" },
      { id: "create", label: "Create" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    actions: [
      { id: "view", label: "View" },
      { id: "edit", label: "Edit" },
    ],
  },
];

// Helper to count total active permissions for a role
function getPermissionCount(role) {
  if (!role || !role.permissions) return 0;
  let count = 0;
  Object.values(role.permissions).forEach((actions) => {
    if (Array.isArray(actions)) count += actions.length;
  });
  return count;
}

export default function UsersAndRolesView() {
  const {
    users,
    roles,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    addRole,
    updateRole,
    deleteRole,
    hasPermission,
    navigateTo,
    currentUser,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "roles"
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUserTarget, setEditUserTarget] = useState(null);
  const [viewUserTarget, setViewUserTarget] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editRoleTarget, setEditRoleTarget] = useState(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const [actionError, setActionError] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Route protection check
  const canViewUsers = hasPermission("users", "view");
  const canViewRoles = hasPermission("roles", "view");

  if (!canViewUsers && !canViewRoles) {
    return (
      <div className="admin-fade-in" style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", marginTop: "24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Lock size={32} />
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#14151A", margin: 0 }}>Access Denied</h3>
        <p style={{ fontSize: "14px", color: "#6B6B75", margin: "8px 0 24px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
          You don't have permission to access the Users & Roles management system. Contact your Super Admin for access.
        </p>
        <button onClick={() => navigateTo("dashboard")} style={primaryBtnStyle}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesRole = roleFilter === "all" || u.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleDeleteUserConfirm = () => {
    if (!deleteUserTarget) return;
    const res = deleteUser(deleteUserTarget.id);
    if (!res.success) {
      setActionError(res.error);
    } else {
      showToast(`User "${deleteUserTarget.name}" deleted successfully.`);
    }
    setDeleteUserTarget(null);
  };

  const handleDeleteRoleConfirm = () => {
    if (!deleteRoleTarget) return;
    const res = deleteRole(deleteRoleTarget.id);
    if (!res.success) {
      setActionError(res.error);
    } else {
      showToast(`Role "${deleteRoleTarget.name}" deleted successfully.`);
    }
    setDeleteRoleTarget(null);
  };

  const getRoleBadgeStyle = (roleId) => {
    switch (roleId) {
      case "role-super-admin":
        return { bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" };
      case "role-admin":
        return { bg: "#E0F2FE", color: "#0284C7", border: "#BAE6FD" };
      case "role-manager":
        return { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A" };
      case "role-staff":
        return { bg: "#F3F4F6", color: "#4B5563", border: "#E5E7EB" };
      default:
        return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    }
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 99999,
          backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "adminFadeIn 0.25s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Main Header & Subtitle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#14151A", margin: 0 }}>Users & Roles</h3>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>
            Manage admin users, assign system roles, and configure detailed permissions.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          {activeTab === "users" && hasPermission("users", "create") && (
            <button onClick={() => setIsAddUserOpen(true)} className="admin-btn-hover" style={primaryBtnStyle}>
              <Plus size={18} /> Add User
            </button>
          )}
          {activeTab === "roles" && hasPermission("roles", "create") && (
            <button onClick={() => setIsAddRoleOpen(true)} className="admin-btn-hover" style={primaryBtnStyle}>
              <Plus size={18} /> Create Role
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid #E7E7E2", gap: "24px" }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 4px", fontSize: "14px", fontWeight: 600, background: "none", border: "none", cursor: "pointer",
            color: activeTab === "users" ? "#1B1F8C" : "#6B6B75",
            borderBottom: activeTab === "users" ? "2px solid #1B1F8C" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "8px", fontFamily: "inherit",
          }}
        >
          <UsersIcon size={18} /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          style={{
            padding: "10px 4px", fontSize: "14px", fontWeight: 600, background: "none", border: "none", cursor: "pointer",
            color: activeTab === "roles" ? "#1B1F8C" : "#6B6B75",
            borderBottom: activeTab === "roles" ? "2px solid #1B1F8C" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "8px", fontFamily: "inherit",
          }}
        >
          <Shield size={18} /> Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* ── TAB 1: USERS ───────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Filters Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E7E7E2" }}>
            {/* Search Input */}
            <div style={{ position: "relative", width: "300px", minWidth: 0, flex: 1 }}>
              <Search size={18} color="#6B6B75" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                style={searchInputStyle}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={clearBtnStyle}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Role & Status Filter Dropdowns */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", color: "#6B6B75", fontWeight: 500 }}>Role:</span>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectFilterStyle}>
                  <option value="all">All Roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", color: "#6B6B75", fontWeight: 500 }}>Status:</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectFilterStyle}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Data Table */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", overflowX: "auto" }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "#6B6B75" }}>
                <UsersIcon size={36} color="#9CA3AF" style={{ marginBottom: "12px" }} />
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#14151A", margin: 0 }}>No users found</h4>
                <p style={{ fontSize: "13px", margin: "4px 0 0" }}>Try adjusting your search query or filters.</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFAF7", borderBottom: "1px solid #E7E7E2" }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Login</th>
                    <th style={thStyle}>Created</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const roleObj = roles.find((r) => r.id === u.roleId) || { name: "User" };
                    const badge = getRoleBadgeStyle(u.roleId);
                    const isSelf = u.id === currentUser?.id;

                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #F0F0EC" }}>
                        {/* User avatar + name */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              backgroundColor: badge.bg, color: badge.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "14px", fontWeight: 700, flexShrink: 0,
                              border: `1px solid ${badge.border}`,
                            }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#14151A" }}>
                                {u.name} {isSelf && <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: 700, marginLeft: "4px" }}>(You)</span>}
                              </div>
                              <div style={{ fontSize: "11px", color: "#6B6B75" }}>{u.phone || "No phone"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: "14px 16px", color: "#4B5563", fontWeight: 500 }}>{u.email}</td>

                        {/* Role Badge */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px",
                            backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          }}>
                            {roleObj.name}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px",
                            backgroundColor: u.status === "Active" ? "#DCFCE7" : "#FEE2E2",
                            color: u.status === "Active" ? "#16A34A" : "#DC2626",
                            display: "inline-flex", alignItems: "center", gap: "6px",
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: u.status === "Active" ? "#16A34A" : "#DC2626" }} />
                            {u.status}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td style={{ padding: "14px 16px", color: "#6B6B75" }}>{u.lastLogin}</td>

                        {/* Created */}
                        <td style={{ padding: "14px 16px", color: "#6B6B75" }}>{u.createdAt}</td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {/* View */}
                            <button onClick={() => setViewUserTarget(u)} style={iconBtnStyle} title="View Details">
                              <Eye size={15} color="#1B1F8C" />
                            </button>

                            {/* Edit */}
                            {hasPermission("users", "edit") && (
                              <button onClick={() => setEditUserTarget(u)} style={iconBtnStyle} title="Edit User">
                                <Pencil size={15} color="#F59E0B" />
                              </button>
                            )}

                            {/* Toggle Status */}
                            {hasPermission("users", "edit") && !isSelf && (
                              <button
                                onClick={() => {
                                  toggleUserStatus(u.id);
                                  showToast(`User "${u.name}" status changed to ${u.status === "Active" ? "Inactive" : "Active"}.`);
                                }}
                                style={{ ...iconBtnStyle, backgroundColor: u.status === "Active" ? "#FFF5F5" : "#F0FDF4" }}
                                title={u.status === "Active" ? "Deactivate User" : "Activate User"}
                              >
                                <Power size={15} color={u.status === "Active" ? "#DC2626" : "#16A34A"} />
                              </button>
                            )}

                            {/* Delete */}
                            {hasPermission("users", "delete") && !isSelf && (
                              <button onClick={() => setDeleteUserTarget(u)} style={iconBtnStyle} title="Delete User">
                                <Trash2 size={15} color="#DC2626" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ROLES ───────────────────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {roles.map((r) => {
            const assignedCount = users.filter((u) => u.roleId === r.id).length;
            const permCount = getPermissionCount(r);
            const badge = getRoleBadgeStyle(r.id);

            return (
              <div key={r.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: badge.bg, color: badge.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>{r.name}</h4>
                        {r.isSystemRole && (
                          <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#F0F0EC", color: "#6B6B75", padding: "2px 6px", borderRadius: "4px" }}>
                            SYSTEM DEFAULT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "12px", minHeight: "36px", lineHeight: 1.4 }}>
                    {r.description}
                  </p>

                  <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #F0F0EC", fontSize: "12px", color: "#4B5563" }}>
                    <div>
                      <strong style={{ color: "#14151A" }}>{assignedCount}</strong> {assignedCount === 1 ? "user" : "users"} assigned
                    </div>
                    <div>
                      <strong style={{ color: "#14151A" }}>{permCount}</strong> permissions granted
                    </div>
                  </div>
                </div>

                {/* Role Actions */}
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  {hasPermission("roles", "edit") && (
                    <button
                      onClick={() => setEditRoleTarget(r)}
                      style={{ ...outlineBtnStyle, fontSize: "12px", height: "34px", padding: "0 14px" }}
                    >
                      <Pencil size={14} color="#F59E0B" /> {r.isSystemRole ? "View / Edit Permissions" : "Edit Role"}
                    </button>
                  )}

                  {hasPermission("roles", "delete") && !r.isSystemRole && (
                    <button
                      onClick={() => setDeleteRoleTarget(r)}
                      style={{ ...iconBtnStyle, width: "34px", height: "34px" }}
                      title="Delete Role"
                    >
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ───────────────────────────────────────────────────────────────── */}

      {/* 1. ADD USER MODAL */}
      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          roles={roles}
          users={users}
          onAddUser={(userData) => {
            const res = addUser(userData);
            if (res.success) showToast(`User "${userData.name}" created successfully.`);
          }}
        />
      )}

      {/* 2. EDIT USER MODAL */}
      {editUserTarget && (
        <EditUserModal
          isOpen={!!editUserTarget}
          onClose={() => setEditUserTarget(null)}
          user={editUserTarget}
          roles={roles}
          onUpdateUser={(id, data) => {
            updateUser(id, data);
            showToast(`User "${data.name || editUserTarget.name}" updated successfully.`);
          }}
        />
      )}

      {/* 3. USER DETAILS MODAL */}
      {viewUserTarget && (
        <UserDetailsModal
          isOpen={!!viewUserTarget}
          onClose={() => setViewUserTarget(null)}
          user={viewUserTarget}
          roles={roles}
        />
      )}

      {/* 4. DELETE USER CONFIRM DIALOG */}
      {deleteUserTarget && (
        <ConfirmModal
          isOpen={!!deleteUserTarget}
          onClose={() => setDeleteUserTarget(null)}
          onConfirm={handleDeleteUserConfirm}
          title="Delete User?"
          message={`Are you sure you want to delete "${deleteUserTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete User"
          confirmColor="#DC2626"
        />
      )}

      {/* 5. CREATE ROLE MODAL */}
      {isAddRoleOpen && (
        <RoleModal
          isOpen={isAddRoleOpen}
          onClose={() => setIsAddRoleOpen(false)}
          roles={roles}
          onSaveRole={(roleData) => {
            const res = addRole(roleData);
            if (res.success) showToast(`Role "${roleData.name}" created successfully.`);
          }}
        />
      )}

      {/* 6. EDIT ROLE MODAL */}
      {editRoleTarget && (
        <RoleModal
          isOpen={!!editRoleTarget}
          onClose={() => setEditRoleTarget(null)}
          role={editRoleTarget}
          roles={roles}
          onSaveRole={(roleData) => {
            updateRole(editRoleTarget.id, roleData);
            showToast(`Role "${roleData.name}" updated successfully.`);
          }}
        />
      )}

      {/* 7. DELETE ROLE CONFIRM DIALOG */}
      {deleteRoleTarget && (
        <ConfirmModal
          isOpen={!!deleteRoleTarget}
          onClose={() => setDeleteRoleTarget(null)}
          onConfirm={handleDeleteRoleConfirm}
          title="Delete Role?"
          message={`Are you sure you want to delete the role "${deleteRoleTarget?.name}"?`}
          confirmLabel="Delete Role"
          confirmColor="#DC2626"
        />
      )}

      {/* 8. ACTION ERROR ALERT DIALOG */}
      {actionError && (
        <ConfirmModal
          isOpen={!!actionError}
          onClose={() => setActionError(null)}
          onConfirm={() => setActionError(null)}
          title="Action Not Allowed"
          message={actionError}
          confirmLabel="OK"
          confirmColor="#1B1F8C"
        />
      )}
    </div>
  );
}

// ─── ADD USER MODAL ──────────────────────────────────────────────────────────
function AddUserModal({ isOpen, onClose, roles, users, onAddUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id || "role-admin");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState({});

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!name.trim()) err.name = "Full Name is required.";
    if (!email.trim()) {
      err.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = "Please enter a valid email address.";
    } else if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      err.email = "A user with this email address already exists.";
    }

    if (!password) {
      err.password = "Password is required.";
    } else if (password.length < 6) {
      err.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      err.confirmPassword = "Passwords do not match.";
    }

    if (!roleId) err.roleId = "Role selection is required.";

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    onAddUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, roleId, status });
    onClose();
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#14151A" }}>Add New User</h4>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Vikram Singh" />
            {errors.name && <span style={errStyle}>{errors.name}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="vikram@mellosoft.com" />
              {errors.email && <span style={errStyle}>{errors.email}</span>}
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+91 98765 00000" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              {errors.password && <span style={errStyle}>{errors.password}</span>}
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              {errors.confirmPassword && <span style={errStyle}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Assign Role *</label>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)} style={inputStyle}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.roleId && <span style={errStyle}>{errors.roleId}</span>}
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={primaryBtnStyle}>Create User</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── EDIT USER MODAL ─────────────────────────────────────────────────────────
function EditUserModal({ isOpen, onClose, user, roles, onUpdateUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState(user.status);

  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!name.trim()) err.name = "Full Name is required.";
    if (!email.trim()) err.email = "Email address is required.";

    if (changePassword) {
      if (!password) err.password = "New password is required.";
      else if (password.length < 6) err.password = "Password must be at least 6 characters.";
      if (password !== confirmPassword) err.confirmPassword = "Passwords do not match.";
    }

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    onUpdateUser(user.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleId,
      status,
      password: changePassword ? password : undefined,
    });
    onClose();
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#14151A" }}>Edit User: {user.name}</h4>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            {errors.name && <span style={errStyle}>{errors.name}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              {errors.email && <span style={errStyle}>{errors.email}</span>}
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Role *</label>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)} style={inputStyle}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Change Password Option */}
          <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #E7E7E2" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#14151A", cursor: "pointer" }}>
              <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} />
              Change Password
            </label>

            {changePassword && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
                  {errors.password && <span style={errStyle}>{errors.password}</span>}
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
                  {errors.confirmPassword && <span style={errStyle}>{errors.confirmPassword}</span>}
                </div>
              </div>
            )}
          </div>

          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={primaryBtnStyle}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── USER DETAILS MODAL ──────────────────────────────────────────────────────
function UserDetailsModal({ isOpen, onClose, user, roles }) {
  if (!isOpen || typeof document === "undefined") return null;
  const roleObj = roles.find((r) => r.id === user.roleId) || { name: "User", permissions: {} };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#14151A" }}>User Profile & Granted Permissions</h4>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* User Info Header */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", backgroundColor: "#FAFAF7", padding: "16px", borderRadius: "12px", border: "1px solid #E7E7E2" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#E8E9F8", color: "#1B1F8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>{user.name}</h4>
              <p style={{ fontSize: "13px", color: "#6B6B75", margin: "2px 0 0" }}>{user.email} • {user.phone || "No phone"}</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#E8E9F8", color: "#1B1F8C", padding: "2px 8px", borderRadius: "999px" }}>
                  Role: {roleObj.name}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: user.status === "Active" ? "#DCFCE7" : "#FEE2E2", color: user.status === "Active" ? "#16A34A" : "#DC2626", padding: "2px 8px", borderRadius: "999px" }}>
                  Status: {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Module Permissions Breakdown */}
          <div>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", marginBottom: "12px" }}>Module Permissions</h5>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {ALL_MODULES.map((mod) => {
                const granted = roleObj.permissions?.[mod.id] || [];
                return (
                  <div key={mod.id} style={{ border: "1px solid #E7E7E2", borderRadius: "8px", padding: "10px 12px", backgroundColor: "#FFFFFF" }}>
                    <div style={{ fontWeight: 600, fontSize: "12px", color: "#14151A" }}>{mod.label}</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                      {mod.actions.map((act) => {
                        const hasPerm = granted.includes(act.id);
                        return (
                          <span key={act.id} style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: hasPerm ? "#DCFCE7" : "#F3F4F6", color: hasPerm ? "#16A34A" : "#9CA3AF" }}>
                            {act.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={primaryBtnStyle}>Close</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── CREATE / EDIT ROLE MODAL ────────────────────────────────────────────────
function RoleModal({ isOpen, onClose, role, roles, onSaveRole }) {
  const isEdit = !!role;
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [permissions, setPermissions] = useState(() => {
    if (role && role.permissions) {
      return JSON.parse(JSON.stringify(role.permissions));
    }
    // Default initial blank perms
    const p = {};
    ALL_MODULES.forEach((m) => { p[m.id] = []; });
    return p;
  });

  const [errors, setErrors] = useState({});

  if (!isOpen || typeof document === "undefined") return null;

  const toggleAction = (moduleId, actionId) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || [];
      const updated = current.includes(actionId)
        ? current.filter((a) => a !== actionId)
        : [...current, actionId];
      return { ...prev, [moduleId]: updated };
    });
  };

  const handleSelectAll = () => {
    const p = {};
    ALL_MODULES.forEach((m) => {
      p[m.id] = m.actions.map((a) => a.id);
    });
    setPermissions(p);
  };

  const handleClearAll = () => {
    const p = {};
    ALL_MODULES.forEach((m) => {
      p[m.id] = [];
    });
    setPermissions(p);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!name.trim()) err.name = "Role Name is required.";
    else if (!isEdit && roles.some((r) => r.name.toLowerCase() === name.trim().toLowerCase())) {
      err.name = "A role with this name already exists.";
    }

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    onSaveRole({
      name: name.trim(),
      description: description.trim(),
      permissions,
    });
    onClose();
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#14151A" }}>
            {isEdit ? `Edit Role: ${role.name}` : "Create Custom Role"}
          </h4>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Role Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Inventory Auditor"
              disabled={role?.isSystemRole}
            />
            {role?.isSystemRole && <span style={{ fontSize: "11px", color: "#6B6B75" }}>System default role names cannot be renamed.</span>}
            {errors.name && <span style={errStyle}>{errors.name}</span>}
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              placeholder="Describe the responsibilities and scope of this role..."
            />
          </div>

          {/* Permissions Matrix Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: 0 }}>Module Permissions</h5>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" onClick={handleSelectAll} style={{ ...outlineBtnStyle, fontSize: "11px", padding: "4px 8px" }}>Select All</button>
              <button type="button" onClick={handleClearAll} style={{ ...outlineBtnStyle, fontSize: "11px", padding: "4px 8px" }}>Clear All</button>
            </div>
          </div>

          {/* Grouped Permission Checkboxes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {ALL_MODULES.map((mod) => {
              const currentActions = permissions[mod.id] || [];
              return (
                <div key={mod.id} style={{ border: "1px solid #E7E7E2", borderRadius: "10px", padding: "12px", backgroundColor: "#FAFAF7" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#14151A", marginBottom: "8px" }}>{mod.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {mod.actions.map((act) => {
                      const isChecked = currentActions.includes(act.id);
                      return (
                        <label key={act.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#4B5563", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAction(mod.id, act.id)}
                          />
                          {act.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={primaryBtnStyle}>{isEdit ? "Save Changes" : "Create Role"}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── CONFIRM MODAL ───────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmColor = "#1B1F8C" }) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "420px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: "0 0 8px" }}>{title}</h4>
        <p style={{ fontSize: "13px", color: "#6B6B75", margin: "0 0 20px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{ ...primaryBtnStyle, backgroundColor: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── REUSABLE STYLES ─────────────────────────────────────────────────────────
const primaryBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 18px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
};

const outlineBtnStyle = {
  display: "flex", alignItems: "center", gap: "6px", border: "1px solid #E7E7E2",
  borderRadius: "8px", backgroundColor: "#FFFFFF", color: "#14151A", cursor: "pointer",
  fontFamily: "inherit", fontWeight: 600,
};

const cancelBtnStyle = {
  height: "40px", padding: "0 18px", border: "1px solid #E7E7E2", borderRadius: "10px",
  backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

const searchInputStyle = {
  width: "100%", height: "40px", border: "1px solid #E7E7E2", borderRadius: "10px",
  padding: "0 36px 0 40px", fontSize: "13px", color: "#14151A", backgroundColor: "#FFFFFF",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

const selectFilterStyle = {
  height: "36px", border: "1px solid #E7E7E2", borderRadius: "8px", padding: "0 10px",
  fontSize: "12px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none",
};

const clearBtnStyle = {
  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "#6B6B75", display: "flex",
};

const backdropStyle = {
  position: "fixed", inset: 0, backgroundColor: "rgba(20, 21, 26, 0.5)",
  backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center",
  justifyContent: "center", padding: "16px",
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E7E7E2",
  width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
  animation: "adminScaleIn 0.2s ease-out",
};

const modalHeaderStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", borderBottom: "1px solid #E7E7E2", backgroundColor: "#FAFAF7",
};

const modalFooterStyle = {
  display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px",
  paddingTop: "12px", borderTop: "1px solid #E7E7E2",
};

const closeBtnStyle = {
  background: "none", border: "none", cursor: "pointer", color: "#6B6B75", display: "flex",
};

const iconBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};

const fieldGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const inputStyle = {
  height: "40px", padding: "0 12px", border: "1px solid #E7E7E2", borderRadius: "10px",
  fontSize: "13px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit",
  outline: "none", width: "100%", boxSizing: "border-box",
};
const errStyle = { fontSize: "12px", color: "#DC2626", fontWeight: 500 };
const thStyle = { textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", letterSpacing: "0.05em" };
