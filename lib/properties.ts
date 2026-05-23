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
  // Demo blocked dates (ISO YYYY-MM-DD)
  blockedDates: string[];
};

const CASA_MARINA: Property = {
  slug: "casa-marina",
  name: "Casa Marina",
  type: "Hotel boutique",
  city: "Cartagena",
  neighborhood: "Centro Histórico",
  address: "Calle del Curato 38-99",
  rating: 4.9,
  reviewCount: 87,
  totalRooms: 12,
  checkIn: "15:00",
  checkOut: "12:00",
  minStay: 2,
  responseTime: "<1 hora",
  description:
    "Casa colonial restaurada en el corazón del centro histórico, a 3 minutos caminando de Plaza Santo Domingo. Doce habitaciones distribuidas en dos pisos alrededor de un patio interior con buganvilla. Desayuno servido en el patio. Recepción 24 horas atendida por nuestro equipo.",
  amenities: [
    "wifi",
    "ac",
    "pool",
    "breakfast",
    "parking",
    "reception",
    "patio",
    "laundry",
  ],
  rooms: [
    {
      id: "suite-marina",
      name: "Suite Marina",
      beds: "1 cama King",
      capacity: 2,
      area: 28,
      basePriceCOP: 450000,
      description:
        "Suite con balcón propio sobre el patio. Tina exenta, vista a la buganvilla, escritorio con luz natural.",
      units: 3,
      amenities: ["Wifi", "A/C", "Balcón", "Tina"],
      photo: {
        src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
        alt: "Suite Marina con cama king, balcón sobre el patio y tina exenta.",
      },
    },
    {
      id: "tropical",
      name: "Habitación Tropical",
      beds: "2 camas Queen",
      capacity: 4,
      area: 24,
      basePriceCOP: 320000,
      description:
        "Habitación amplia con dos camas y techos de 4 metros. Ventanas al patio, ideal para familias o amigos.",
      units: 5,
      amenities: ["Wifi", "A/C", "Vista al patio", "Techos altos"],
      photo: {
        src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
        alt: "Habitación Tropical con dos camas queen y techos altos de cuatro metros.",
      },
    },
    {
      id: "estandar",
      name: "Habitación Estándar",
      beds: "1 cama Queen",
      capacity: 2,
      area: 18,
      basePriceCOP: 220000,
      description:
        "Habitación íntima con muros de cal y piso original. Para quien quiere lo esencial bien hecho.",
      units: 4,
      amenities: ["Wifi", "A/C", "Muros de cal"],
      photo: {
        src: "https://images.unsplash.com/photo-1631049035634-c01a8aa1c9d4?auto=format&fit=crop&w=900&q=80",
        alt: "Habitación Estándar con muros de cal y piso original colonial.",
      },
    },
  ],
  photos: [
    { src: "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?auto=format&fit=crop&w=1600&q=85", alt: "Patio principal con buganvilla" },
    { src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=85", alt: "Habitación con linos blancos" },
    { src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85", alt: "Rincón con vegetación tropical" },
    { src: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=85", alt: "Desayuno con café colombiano en el patio" },
    { src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=85", alt: "Balcones de la fachada" },
    { src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=85", alt: "Habitación con techos altos" },
    { src: "https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=1600&q=85", alt: "Puerta colonial de madera" },
    { src: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1600&q=85", alt: "Sala común al atardecer" },
  ],
  faq: [
    {
      q: "¿Cómo pago mi reserva?",
      a: "Aceptamos PSE (instantáneo) o transferencia bancaria con comprobante. Te enviamos los datos al confirmar la reserva.",
    },
    {
      q: "¿Puedo cancelar?",
      a: "Cancelación gratuita hasta 48 horas antes del check-in. Después, se cobra la primera noche.",
    },
    {
      q: "¿Reciben mascotas?",
      a: "Sí, dos por habitación, con un cargo adicional de COP $50.000 por estancia. Avísanos al reservar.",
    },
    {
      q: "¿Hay parqueadero?",
      a: "Sí, parqueadero gratuito dentro de la propiedad. Cupos limitados; el primero que llega, escoge.",
    },
    {
      q: "¿Niños?",
      a: "Bienvenidos. Niños hasta 6 años no pagan compartiendo habitación con padres.",
    },
  ],
  coords: { lat: 10.4239, lng: -75.5485 },
  blockedDates: [
    "2026-05-24", "2026-05-25", "2026-05-26",
    "2026-06-10", "2026-06-11",
    "2026-06-20", "2026-06-21", "2026-06-22",
  ],
};

const ALL: Record<string, Property> = {
  [CASA_MARINA.slug]: CASA_MARINA,
};

export function getProperty(slug: string): Property | null {
  return ALL[slug] ?? null;
}

export function getAllPropertySlugs(): string[] {
  return Object.keys(ALL);
}
