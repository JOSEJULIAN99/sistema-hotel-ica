import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Hotel Princes Ica | Sistema de Gestión Hotelera & Huéspedes",
  description: "Plataforma integral de gestión hotelera, reservas, check-in, habitaciones y servicios turísticos del Hotel Princes Ica.",
  keywords: "Hotel Ica, Huacachina, Hotel Princes, Reservas, Hospedaje, Check-in Hotel",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
