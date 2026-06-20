import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-50 border-t border-gray-100 dark:border-gray-800">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-xl">UstaGo</span>
            </div>
            <p className="text-sm text-gray-500">Uzbekistan's trusted service marketplace connecting customers with verified masters.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/categories" className="hover:text-primary">Find a Master</Link></li>
              <li><Link href="/masters" className="hover:text-primary">Browse Masters</Link></li>
              <li><Link href="/orders/create" className="hover:text-primary">Create Order</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} UstaGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
