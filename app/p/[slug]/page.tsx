import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicPropertyBySlug } from "@/lib/db/queries/public-property";
import { PropertyTopbar } from "@/components/property/PropertyTopbar";
import { PropertyHero } from "@/components/property/PropertyHero";
import { PropertyDescription } from "@/components/property/PropertyDescription";
import { PropertyAmenities } from "@/components/property/PropertyAmenities";
import { PropertyRooms } from "@/components/property/PropertyRooms";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyMap } from "@/components/property/PropertyMap";
import { PropertyFAQ } from "@/components/property/PropertyFAQ";
import { BookingProvider } from "@/components/property/BookingProvider";
import { BookingWidget } from "@/components/property/BookingWidget";
import { MobileBookingCTA } from "@/components/property/MobileBookingCTA";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: `${property.name} · ${property.type} en ${property.city} — gestionado con Eztadia`,
    description: property.description,
    openGraph: {
      title: `${property.name} · ${property.city}`,
      description: property.description,
      type: "website",
      locale: "es_CO",
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) notFound();

  return (
    <>
      <PropertyTopbar propertyName={property.name} />

      <main id="main">
        <PropertyHero property={property} />

        <div className="mx-auto w-full max-w-[1120px] px-5 lg:px-8 pt-20">
          <BookingProvider property={property}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-12 lg:gap-[72px] items-start">
              <div className="min-w-0">
                <PropertyDescription property={property} />
                <PropertyAmenities property={property} />
                <PropertyRooms />
                <PropertyGallery photos={property.photos} propertyName={property.name} />
                <PropertyMap property={property} />
                <PropertyFAQ items={property.faq} />
              </div>

              <aside
                aria-label="Reservar tu estancia"
                className="hidden lg:block sticky top-[100px] self-start"
              >
                <BookingWidget />
              </aside>
            </div>

            <MobileBookingCTA />
          </BookingProvider>
        </div>
      </main>

      <footer id="contact" className="py-20 px-8 border-t border-rule text-center text-[13px] text-ink-muted">
        Hospedaje gestionado con{" "}
        <a href="/" className="text-ink-soft border-b border-transparent hover:border-ink-soft transition-colors pb-px">
          Eztadia
        </a>{" "}
        · {property.city}, Colombia
      </footer>
    </>
  );
}
