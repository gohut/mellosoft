import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import { CustomerAuthProvider } from "../context/CustomerAuthContext";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Mellosoft | Premium Mattress & Sleep Products",
  description: "Sleep in luxury… Wake up refreshed… Browse Mellosoft's line of handcrafted orthopedic mattresses, luxury down pillows, and organic bamboo protectors.",
  keywords: "mattress, sleep products, luxury bedding, down pillow, orthopedic mattress, hybrid mattress, organic cotton",
  openGraph: {
    title: "Mellosoft | Premium Sleep Brand",
    description: "Sleep in luxury… Wake up refreshed…",
    images: ["/asset/logo.png"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CustomerAuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
