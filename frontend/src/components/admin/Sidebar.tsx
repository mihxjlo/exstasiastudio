'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthToken } from '@/lib/auth';

const sidebarLinks = [
  { name: 'Galleries', href: '/admin' },
  { name: 'Portrait', href: '/admin/portrait' },
  { name: 'Editorial', href: '/admin/editorial' },
  { name: 'Campaign', href: '/admin/campaign' },
  { name: 'Events', href: '/admin/events' },
  { name: 'Hero Image', href: '/admin/hero' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    clearAuthToken();
    document.cookie = 'exstasia_jwt=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <aside
      className={[
        'w-56 bg-zinc-900 flex flex-col justify-between py-6 px-4 flex-shrink-0',
        'fixed inset-y-0 left-0 z-40',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:translate-x-0',
      ].join(' ')}
    >
      <div>
        {/* Wordmark + mobile close button */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="block">
            <span className="text-ex-text text-sm tracking-[0.15em] lowercase font-light">
              exstasia studio
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-zinc-500 hover:text-white p-1 -mr-1"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className={`px-3 py-2 rounded text-xs uppercase tracking-[0.15em] font-medium transition-colors duration-150 ${
                isActive(link.href)
                  ? 'text-ex-pink bg-zinc-800'
                  : 'text-zinc-400 hover:text-ex-blue hover:bg-zinc-800/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="text-zinc-500 hover:text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors duration-150 text-left px-3 py-2"
      >
        Sign Out
      </button>
    </aside>
  );
}
