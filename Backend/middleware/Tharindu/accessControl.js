const ELEVATED_ROLES = new Set(["admin", "doctor"]);

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value.toString === "function") return value.toString();
  return String(value);
};

export const hasElevatedMonitoringAccess = (user) => {
  return Boolean(user && ELEVATED_ROLES.has(user.role));
};

export const isOwnResource = (user, ownerId) => {
  const currentUserId = normalizeId(user?._id || user?.id || user?.userId);
  return Boolean(currentUserId && currentUserId === normalizeId(ownerId));
};

export const canAccessUserScopedResource = (user, ownerId) => {
  return hasElevatedMonitoringAccess(user) || isOwnResource(user, ownerId);
};

export const resolveScopedUserId = (user, requestedUserId) => {
  if (hasElevatedMonitoringAccess(user) && requestedUserId) {
    return requestedUserId;
  }

  return user?._id || user?.id || user?.userId || requestedUserId;
};

export const rejectForbidden = (
  res,
  message = "You do not have permission to access this resource",
) => {
  return res.status(403).json({ message });
};
