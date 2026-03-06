const STORAGE_KEYS = {
  users: 'demo.users',
  stylists: 'demo.stylists',
  services: 'demo.services',
  bookings: 'demo.bookings',
}

const DEFAULT_DATA = {
  users: [
    { id: 1, name: 'Ava Johnson', email: 'ava@example.com', phone: '072 100 2001', role: 'customer', isBlocked: false },
    { id: 2, name: 'Noah Smith', email: 'noah@example.com', phone: '072 100 2002', role: 'customer', isBlocked: false },
    { id: 3, name: 'Mia Brown', email: 'mia@example.com', phone: '072 100 2003', role: 'customer', isBlocked: true },
  ],
  stylists: [
    {
      id: 1,
      name: 'Lerato Dlamini',
      email: 'lerato@example.com',
      phone: '073 300 4001',
      specialty: 'Hair Stylist',
      services: ['Haircut'],
      workingHours: '09:00 - 17:00',
      isActive: true,
    },
    {
      id: 2,
      name: 'Thabo Mokoena',
      email: 'thabo@example.com',
      phone: '073 300 4002',
      specialty: 'Color Specialist',
      services: ['Hair Coloring'],
      workingHours: '10:00 - 18:00',
      isActive: true,
    },
  ],
  services: [
    { id: 1, name: 'Haircut', price: 150, duration: 45, isActive: true },
    { id: 2, name: 'Hair Coloring', price: 350, duration: 90, isActive: true },
    { id: 3, name: 'Braiding', price: 500, duration: 120, isActive: true },
  ],
  bookings: [
    {
      id: 1,
      userId: 1,
      customerName: 'Ava Johnson',
      email: 'ava@example.com',
      stylistId: 1,
      stylistName: 'Lerato Dlamini',
      serviceName: 'Haircut',
      date: '2026-03-01',
      status: 'confirmed',
      amount: 150,
    },
    {
      id: 2,
      userId: 2,
      customerName: 'Noah Smith',
      email: 'noah@example.com',
      stylistId: 2,
      stylistName: 'Thabo Mokoena',
      serviceName: 'Hair Coloring',
      date: '2026-03-02',
      status: 'pending',
      amount: 350,
    },
    {
      id: 3,
      userId: 1,
      customerName: 'Ava Johnson',
      email: 'ava@example.com',
      stylistId: 1,
      stylistName: 'Lerato Dlamini',
      serviceName: 'Braiding',
      date: '2026-03-03',
      status: 'completed',
      amount: 500,
    },
  ],
}

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage

const clone = (value) => JSON.parse(JSON.stringify(value))

const getKey = (entity) => STORAGE_KEYS[entity]

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const seedEntityIfMissing = (entity) => {
  if (!canUseStorage()) return clone(DEFAULT_DATA[entity])
  const key = getKey(entity)
  const existing = window.localStorage.getItem(key)
  if (!existing) {
    const seed = clone(DEFAULT_DATA[entity])
    window.localStorage.setItem(key, JSON.stringify(seed))
    return seed
  }
  return parseJson(existing, clone(DEFAULT_DATA[entity]))
}

const nextId = (list) =>
  list.reduce((maxId, item) => {
    const id = Number(item.id)
    return Number.isFinite(id) ? Math.max(maxId, id) : maxId
  }, 0) + 1

export const isDemoModeEnabled = () =>
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (canUseStorage() && window.localStorage.getItem('useDemoData') === 'true')

export const setDemoModeEnabled = (enabled) => {
  if (!canUseStorage()) return
  window.localStorage.setItem('useDemoData', enabled ? 'true' : 'false')
}

export const getDemoCollection = (entity) => clone(seedEntityIfMissing(entity))

export const addDemoItem = (entity, payload) => {
  const items = seedEntityIfMissing(entity)
  const item = { id: nextId(items), ...payload }
  const next = [...items, item]
  if (canUseStorage()) window.localStorage.setItem(getKey(entity), JSON.stringify(next))
  return clone(item)
}

export const updateDemoItem = (entity, id, payload) => {
  const items = seedEntityIfMissing(entity)
  let updatedItem = null
  const next = items.map((item) => {
    if (String(item.id) !== String(id)) return item
    updatedItem = { ...item, ...payload }
    return updatedItem
  })
  if (canUseStorage()) window.localStorage.setItem(getKey(entity), JSON.stringify(next))
  return clone(updatedItem)
}

export const deleteDemoItem = (entity, id) => {
  const items = seedEntityIfMissing(entity)
  const next = items.filter((item) => String(item.id) !== String(id))
  if (canUseStorage()) window.localStorage.setItem(getKey(entity), JSON.stringify(next))
  return true
}
