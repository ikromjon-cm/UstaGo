import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold mt-4">Page not found</p>
        <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
        <Link href="/" className="btn-primary inline-block mt-8 px-8 py-3 rounded-[12px]">
          Go Home
        </Link>
      </div>
    </div>
  );
}
