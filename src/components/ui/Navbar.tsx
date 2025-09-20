'use client';

import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
} from '@heroui/react';
import { Zap } from 'lucide-react';

type MenuLink = { label: string; href: string };

const MAIN_LINKS: MenuLink[] = [
  { label: 'ฟีเจอร์', href: '#services' },
  { label: 'ราคาแพ็กเกจ', href: '#packages' },
  { label: 'วิธีใช้งาน', href: '#usage' },
  { label: 'ติดต่อเรา', href: '#contracts' },
];

export default function Navbars() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200"
      maxWidth="xl"
    >
      {/* Left: brand + menu toggle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden"
        />
        <Link href='/landing'>
          <NavbarBrand className="gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ZEUS.AI</span>
          </NavbarBrand>
        </Link>
      </NavbarContent>

      {/* Center: desktop links */}
      <NavbarContent className="hidden md:flex gap-6" justify="center">
        {MAIN_LINKS.map((item) => (
          <NavbarItem key={item.label}>
            <Link
              href={item.href}
              className="text-gray-600 hover:text-yellow-600"
              color="foreground"
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Right: CTA */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-white">
            เข้าสู่ระบบ
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        {MAIN_LINKS.map((item) => (
          <NavbarMenuItem key={item.label}>
            <Link
              href={item.href}
              className="w-full text-gray-700 hover:text-yellow-600"
              size="lg"
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white mt-2">
            เข้าสู่ระบบ
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
