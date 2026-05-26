/**
 * Tipos compartidos para la pagina publica /p/[slug] y su flow de booking.
 *
 * Estos tipos describen la shape que consumen los componentes en
 * components/property/* y components/booking-flow/*. La fuente de datos
 * real es lib/db/queries/public-property.ts (DB → adapter).
 *
 * Cuando agreguemos schema para reviews, FAQs, coords, etc, las queries
 * los pueblan y los componentes los renderizan sin cambios.
 */

export type Amenity =
  | "wifi"
  | "ac"
  | "pool"
  | "breakfast"
  | "parking"
  | "reception"
  | "patio"
  | "laundry";

export type RoomType = {
  id: string;
  name: string;
  beds: string;
  capacity: number;
  area: number; // m²
  basePriceCOP: number;
  description: string;
  units: number;
  amenities: string[];
  photo: { src: string; alt: string };
};

export type FAQItem = { q: string; a: string };

export type Photo = { src: string; alt: string; w?: number; h?: number };

export type Property = {
  slug: string;
  name: string;
  type: string;
  city: string;
  neighborhood: string;
  address: string;
  rating: number;
  reviewCount: number;
  totalRooms: number;
  checkIn: string;
  checkOut: string;
  minStay: number;
  responseTime: string;
  description: string;
  amenities: Amenity[];
  rooms: RoomType[];
  photos: Photo[];
  faq: FAQItem[];
  coords: { lat: number; lng: number };
  /** Demo-era blocked dates. Hoy no se pueblan desde DB — la
   * disponibilidad real va por el hold flow + check_availability(). */
  blockedDates: string[];
};
