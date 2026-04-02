export const RESOURCE_CATEGORIES = [
  { value: 'heat', label: 'Heat', icon: '🔥', description: 'Thermal energy, steam, exhaust heat' },
  { value: 'water', label: 'Water', icon: '💧', description: 'Process water, cooling water, wastewater' },
  { value: 'metal', label: 'Metal', icon: '🔩', description: 'Scrap metal, metal shavings, steel' },
  { value: 'plastic', label: 'Plastic', icon: '🧴', description: 'Plastic waste, polymers, packaging' },
  { value: 'paper', label: 'Paper', icon: '📄', description: 'Paper waste, cardboard, packaging' },
  { value: 'glass', label: 'Glass', icon: '🥃', description: 'Glass waste, bottles, panels' },
  { value: 'organic', label: 'Organic', icon: '🌿', description: 'Food waste, biomass, agricultural waste' },
  { value: 'chemical', label: 'Chemical', icon: '🧪', description: 'Chemical byproducts, solvents' },
  { value: 'electricity', label: 'Electricity', icon: '⚡', description: 'Excess power, renewable energy' },
  { value: 'compressed_air', label: 'Compressed Air', icon: '💨', description: 'Compressed air systems' },
  { value: 'other', label: 'Other', icon: '📦', description: 'Other resources' }
];

export const RESOURCE_TYPES = [
  { value: 'waste', label: 'Waste Output', description: 'I have waste materials or byproducts' },
  { value: 'resource', label: 'Resource Input', description: 'I need resources or materials' }
];

export const UNITS = [
  'kg', 'ton', 'liter', 'cubic meter', 'kWh', 'MW', 'kW', 'BTU', 'cubic feet', 'pieces', 'pallet'
];

export const FREQUENCIES = [
  'daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'one-time', 'continuous'
];