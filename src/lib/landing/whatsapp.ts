import { landingPage } from "@/data/landing-page";

export function buildWhatsAppUrl(message: string) {
  const phone = landingPage.contact.whatsapp.phone;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
