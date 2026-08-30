import MellosoftLoader from "../../../components/MellosoftLoader";

/**
 * Admin route-level loading UI.
 * Shown by Next.js App Router during admin route Suspense transitions.
 */
export default function AdminLoading() {
  return <MellosoftLoader label="Loading Admin Panel..." />;
}
