import { DEFAULT_ROLES } from "../data/rolesData";
import { DEFAULT_USERS } from "../data/usersData";

// Shared server-side in-memory data store
let activeRoles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
let activeUsers = JSON.parse(JSON.stringify(DEFAULT_USERS));

/**
 * Get all current active roles
 */
export function getStoredRoles() {
  return activeRoles;
}

/**
 * Get a single role by ID
 */
export function getStoredRoleById(roleId) {
  return activeRoles.find((r) => r.id === roleId) || null;
}

/**
 * Update an existing role's name, description, and permissions
 */
export function updateStoredRole(roleId, updatedData) {
  const index = activeRoles.findIndex((r) => r.id === roleId);
  if (index === -1) return null;

  const existing = activeRoles[index];
  const updatedRole = {
    ...existing,
    name: existing.isSystemRole ? existing.name : (updatedData.name ? updatedData.name.trim() : existing.name),
    description: updatedData.description !== undefined ? updatedData.description.trim() : existing.description,
    permissions: updatedData.permissions || existing.permissions,
  };

  activeRoles[index] = updatedRole;
  return updatedRole;
}

/**
 * Create a new custom role
 */
export function createStoredRole(roleData) {
  const newRole = {
    id: roleData.id || `role-${Date.now()}`,
    name: roleData.name.trim(),
    description: roleData.description ? roleData.description.trim() : `${roleData.name} custom role`,
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

  activeRoles.push(newRole);
  return newRole;
}

/**
 * Delete a custom role
 */
export function deleteStoredRole(roleId) {
  const role = getStoredRoleById(roleId);
  if (!role) return { success: false, error: "Role not found." };
  if (role.isSystemRole) return { success: false, error: "System default roles cannot be deleted." };

  const assignedUsers = activeUsers.filter((u) => u.roleId === roleId);
  if (assignedUsers.length > 0) {
    return {
      success: false,
      error: `Cannot delete role "${role.name}" because ${assignedUsers.length} user(s) are assigned to it.`,
    };
  }

  activeRoles = activeRoles.filter((r) => r.id !== roleId);
  return { success: true };
}

/**
 * Get all current active users
 */
export function getStoredUsers() {
  return activeUsers;
}

/**
 * Get a single user by ID
 */
export function getStoredUserById(userId) {
  return activeUsers.find((u) => u.id === userId) || null;
}

/**
 * Update an existing user
 */
export function updateStoredUser(userId, updatedData) {
  const index = activeUsers.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const existing = activeUsers[index];
  const updatedUser = {
    ...existing,
    name: updatedData.name !== undefined ? updatedData.name.trim() : existing.name,
    email: updatedData.email !== undefined ? updatedData.email.toLowerCase().trim() : existing.email,
    phone: updatedData.phone !== undefined ? updatedData.phone : existing.phone,
    roleId: updatedData.roleId !== undefined ? updatedData.roleId : existing.roleId,
    status: updatedData.status !== undefined ? updatedData.status : existing.status,
  };

  if (updatedData.passwordHash) {
    updatedUser.passwordHash = updatedData.passwordHash;
  }

  activeUsers[index] = updatedUser;
  return updatedUser;
}

/**
 * Create a new user
 */
export function createStoredUser(userData) {
  const newUser = {
    id: userData.id || `user-${Date.now()}`,
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    phone: userData.phone || "",
    passwordHash: userData.passwordHash || "",
    roleId: userData.roleId,
    status: userData.status || "Active",
    lastLogin: "Never",
    createdAt: new Date().toISOString().split("T")[0],
  };

  activeUsers.unshift(newUser);
  return newUser;
}

/**
 * Delete a user
 */
export function deleteStoredUser(userId) {
  const user = getStoredUserById(userId);
  if (!user) return { success: false, error: "User not found." };

  if (user.roleId === "role-super-admin") {
    const superAdmins = activeUsers.filter((u) => u.roleId === "role-super-admin");
    if (superAdmins.length <= 1) {
      return { success: false, error: "Cannot delete the last Super Admin account." };
    }
  }

  activeUsers = activeUsers.filter((u) => u.id !== userId);
  return { success: true };
}
