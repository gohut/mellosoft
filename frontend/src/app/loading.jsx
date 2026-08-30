import MellosoftLoader from "../components/MellosoftLoader";

/**
 * Next.js App Router route-level loading UI.
 * Automatically shown by Next.js during Suspense/data loading
 * on any route under src/app/.
 */
export default function Loading() {
  return <MellosoftLoader />;
}
