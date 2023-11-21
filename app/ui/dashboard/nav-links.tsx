'use client';

import {
  DocumentDuplicateIcon,
  HomeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

/* <Link> component (Chapter 5)
https://nextjs.org/learn/dashboard-app/navigating-between-pages

* This component links between pages in your application. <Link> allows you to
* do client-side navigation with JS. To improve navigation experience, Next.js
* automatically code splits your application by route segments.

This is different from a traditional React SPA, where the browser loads all your
app code on initial load. Splitting code by routes means pages become isolated.
If a certain page throws an error, the rest of the app will still works.

* Futhermore, in production, whenever <Link> components appear in a browser
* Next auto prefetches the code for the linked route in the background.

By the time the user clicks the link, the code for the destination page, it
would already load, making page transition near-instant! */

import Link from 'next/link';

import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
// prettier-ignore
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentDuplicateIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  /* Pattern: Showing active links A common UI pattern is to show an active link
  to indicate to the user what page they are currently on. To do this, you need to
  get the user's current path from the URL. Next.js provides a hook `usePathname`
  that you can use to check the path and implement this pattern. */
  const pathname = usePathname();
  // console.log(pathname);
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-sky-100 text-blue-600': pathname === link.href }
            )}
          >
            <LinkIcon className='w-6' />
            <p className='hidden md:block'>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
