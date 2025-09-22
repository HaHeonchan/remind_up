'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Home, MessageSquare, Calendar, User } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export const Navigation = () => {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/chat', label: 'AI 챗봇', icon: MessageSquare },
    { href: '/reminders', label: '일정 관리', icon: Calendar },
    { href: '/profile', label: '사용자 설정', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MR</span>
            </div>
            <span className="font-bold text-lg text-gray-900">메시지 리마인더</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
