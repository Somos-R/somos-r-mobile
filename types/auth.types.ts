// Roles disponibles en el sistema
export type UserRole = 'citizen' | 'recycler' | 'admin'

// Estado de la cuenta
export type UserStatus = 'active' | 'inactive' | 'suspended'

// Tipo de vehículo del reciclador
export type VehicleType = 'bike' | 'cart' | 'motorcycle' | 'truck'

// -------------------------------------------
// Tipo que refleja la respuesta real del backend
// Basado en UserDetailResponse del servidor
// -------------------------------------------
export interface BackendUser {
  id: string
  email: string
  full_name: string
  phone: string | null
  id_type: string
  id_number: string
  user_type_code: string
  role_code: string | null
  created_at: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  verification_status?: string | null
  association_id?: string | null
}

// -------------------------------------------
// Campos base compartidos por todos los actores
// -------------------------------------------
export interface BaseUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  status: UserStatus
  created_at: string
}

// -------------------------------------------
// Ciudadano — App Mobile
// Solicita recolección de materiales
// -------------------------------------------
export interface Citizen extends BaseUser {
  role: 'citizen'
  phone: string
  address: string
  lat: number
  lng: number
}

// -------------------------------------------
// Reciclador — App Mobile
// Opera en campo, requiere identidad verificada
// -------------------------------------------
export interface Recycler extends BaseUser {
  role: 'recycler'
  phone: string
  cedula: string
  association_id: string
  vehicle_type: VehicleType
  bank_account?: string
  verified_at?: string
}

// -------------------------------------------
// Payloads para requests a la API
// -------------------------------------------

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterCitizenPayload {
  email: string
  password: string
  full_name: string
  phone: string
  address: string
  lat: number
  lng: number
}

export interface RegisterRecyclerPayload {
  email: string
  password: string
  full_name: string
  phone: string
  cedula: string
  association_id: string
  vehicle_type: VehicleType
}

// -------------------------------------------
// Respuesta del servidor tras login/registro
// -------------------------------------------
export interface AuthResponse {
  user: Citizen | Recycler
  token: string
  expires_in: number // segundos, ej: 86400 = 24h
}
