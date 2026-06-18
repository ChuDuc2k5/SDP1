export const ROLE = {
  CUSTOMER: "customer",
  CABIN_OWNER: "cabinOwner",
};

export const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const id = user._id || user.id || user.userId;

  if (!id) {
    return null;
  }

  const role = [ROLE.CUSTOMER, ROLE.CABIN_OWNER].includes(user.role)
    ? user.role
    : ROLE.CUSTOMER;

  return {
    _id: id,
    id,
    userId: id,
    email: user.email,
    role,
    fullName: user.fullName || user.name,
    name: user.fullName || user.name,
  };
};

export const getUserId = (user) => {
  if (!user) return null;
  return user.userId || user.id || user._id || null;
};

export const toViewUser = (user) => {
  const normalized = normalizeUser(user);
  if (!normalized) return null;

  return {
    ...normalized,
    isCabinOwner: normalized.role === ROLE.CABIN_OWNER,
    isCustomer: normalized.role === ROLE.CUSTOMER,
  };
};
