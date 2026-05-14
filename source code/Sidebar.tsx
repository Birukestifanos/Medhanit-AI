'use client';

import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Define nav items
const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
  { name: 'Medical Staff', href: '/dashboard/admin/staff', icon: UserGroupIcon },
  { name: 'Predictions', href: '/dashboard/admin/predictions', icon: DocumentTextIcon },
  { name: 'Patients', href: '/dashboard/admin/patients', icon: UsersIcon },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: CogIcon },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Mock user profile
  const profile = {
    name: 'Dr. Sarah Mitchell',
    role: 'Administrator',
    avatar: 'https://i.pravatar.cc/150?img=62', // Nice placeholder
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.aside
      initial={{ x: -10 }}
      animate={{ x: 0 }}
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white/90 backdrop-blur-md border-r border-sky-100 transition-all duration-500 ease-out flex flex-col h-screen shadow-lg sticky top-0 z-30`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent"
            >
              MedAnit Admin
            </motion.h2>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-sky-700" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-sky-700" />
          )}
        </motion.button>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-sky-100">
        <Link href="/dashboard/admin/profile" className="flex items-center group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-sky-200 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={itemVariants}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500">{profile.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={item.name}
                variants={!isCollapsed ? itemVariants : {}}
                initial={false}
              >
                <Link
                  href={item.href}
                  className={`group flex items-center p-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-sky-600 group-hover:text-sky-700'
                    } ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                  />
                  {!isCollapsed && (
                    <span
                      className={`transition-opacity duration-300 ${
                        isCollapsed ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-sky-100">
        <Link
          href="/logout"
          className="flex items-center p-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 mr-3 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </motion.aside>
  );
}