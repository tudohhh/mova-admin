export type Profile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

export type Driver = {
  id: string
  profile_id: string
  status: string
  vehicle_model: string | null
  vehicle_plate: string | null
  rating: number
  total_orders: number
  earnings_today: number
  current_lat: number | null
  current_lng: number | null
  created_at: string
}

export type Order = {
  id: string
  client_id: string | null
  driver_id: string | null
  service_type: string
  status: string
  pickup_address: string
  dropoff_address: string | null
  price: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  name: string
  type: string
  description: string
  base_price: number
  price_per_km: number | null
  active: boolean
}

export type OrderStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
export type DriverStatus = "online" | "busy" | "offline"