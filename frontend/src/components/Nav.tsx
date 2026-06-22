'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMobileMenu } from './MobileMenuContext';
import { useEffect } from 'react';

const navLinks = [
  { name: 'Portrait', href: '/portrait' },
  { name: 'Editorial', href: '/editorial' },
  { name: 'Campaign', href: '/campaign' },
  { name: 'Events', href: '/events' },
  { name: 'Contact', href: '/contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, toggle } = useMobileMenu();

  // Hooks must be called before any conditional return
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (pathname.startsWith('/admin')) return null;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-[60px] z-40 flex items-center justify-between px-4 md:px-6 select-none bg-transparent">
        {/* Left: Logo Link */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Exstasia Studio"
            width={40}
            height={40}
            priority
            className="object-contain"
          />
        </Link>

        {/* Right Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`uppercase tracking-widest text-[10px] tracking-[0.2em] font-semibold transition-colors duration-150 ${
                isActive(link.href)
                  ? 'text-ex-pink'
                  : 'text-ex-text hover:text-ex-blue'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Mobile Hamburger Icon */}
        <button
          onClick={toggle}
          className="md:hidden text-ex-text focus:outline-none p-2 z-50"
          aria-label="Toggle mobile menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between items-center relative">
            <span
              className={`h-[1.5px] w-full bg-white rounded transform transition-all duration-200 ${
                isOpen ? 'rotate-45 translate-y-[7.5px]' : ''
              }`}
            />
            <span
              className={`h-[1.5px] w-full bg-white rounded transition-all duration-150 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-[1.5px] w-full bg-white rounded transform transition-all duration-200 ${
                isOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Full Screen Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-95 z-40 flex flex-col items-center justify-center transition-all duration-200 md:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div className="flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`uppercase tracking-widest text-sm tracking-[0.25em] font-medium transition-colors duration-150 ${
                isActive(link.href)
                  ? 'text-ex-pink'
                  : 'text-ex-text hover:text-ex-pink'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
