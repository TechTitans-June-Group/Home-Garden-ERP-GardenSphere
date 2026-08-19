export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GARDEN_MANAGER: 'garden_manager',
  GARDENER: 'gardener',
  INVENTORY_MANAGER: 'inventory_manager',
  FINANCE_MANAGER: 'finance_manager',
};

export const ROLE_LIST = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
  [ROLES.GARDEN_MANAGER]: 'Garden Manager',
  [ROLES.GARDENER]: 'Gardener',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.FINANCE_MANAGER]: 'Finance Manager',
};
