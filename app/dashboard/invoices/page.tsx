import { fetchInvoicesPages } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import Pagination from '@/app/ui/invoices/pagination';
import Table from '@/app/ui/invoices/table';
import Search from '@/app/ui/search';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search invoices...' />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

/* Adding Search and Pagination (Chapter 11) cont.

https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

Spend some time familiarizing yourself with the page and the components.

- <Search/> allows users to search for specific invoices.
- <Pagination/> allows users to navigate between pages of invoices.
- <Table/> displays the invoices.

Your search functionality will span to the client and the server. When a user
searches for an invoice on the client, the URL params will be updated, data will
be fetched on the server. The table will re-render on the server with new data.

* Why use URL search params?

URL search params help manage the search state. This pattern may be new if
you're used to doing it with client side state.

There are a couple of benefits of implementing search with URL params:

- Bookmarkable and Shareable URLs: Since the search parameters are in the URL,
users can bookmark the current state of the application, including their search
queries and filters, for future reference or sharing.

- Server-Side Rendering and Initial Load: URL parameters can be directly
consumed on the server to render the initial state, making it easier to handle
server rendering (SSR).

- Analytics and Tracking: Having search queries and filters directly in the URL
makes it easier to track user behavior without requiring any client-side logic.

* Adding search functionality

Next has client-side hooks that can be used implement the search functionality:

- useSearchParams - Allows you to access parameters of the current URL.
> Example: invoices?page=1&query=pending object `{page: '1', query: 'pending'}`

- usePathname - Lets you read the current URL's pathname.
> Example: /dashboard/invoices, usePathname would return '/dashboard/invoices'

- useRouter - Enable navigation between routes programmatically. 
> Example: 'lee' will route to /dashboard/invoices?query=lee

A quick overview of the implementation steps:

1. Capture the user's input in client <Search> component
2. Update the URL using useSearchParams, usePathname, and useRouter hooks 
3. Keeping the URL and input in sync with `defaultValue` prop
4. Update table with search query from server page component's `searchParams`

```tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };
  return (
    <div className='relative flex flex-1 flex-shrink-0'>
      <label htmlFor='search' className='sr-only'>
        Search
      </label>
      <input
        className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
    </div>
  );
}
```

* Here's a breakdown of what's happening:

- ${pathname} from usePathname is the current path, "/dashboard/invoices".
- When a user types, params.toString translates to URL friendly format.
- We use the params set method to update the query param with the user's input.
- The router replaces (${pathname}?${params.toString()}) when updating the URL.
- Example /dashboard/invoices?query=lee if the user searches "Lee".
- A server page component responds to requests with updated searchParams.

The URL is updated without reloading the page, thanks to Next.js's client-side
navigation (covered in chapter on navigating between pages.

* defaultValue vs. value / Controlled vs. Uncontrolled

If you're using state to manage the value of an input, you'd use the value
attribute to make it a controlled component. React would manage input state. 

```jsx
<input
  className="peer block w-full rounded-md ..."
  placeholder={placeholder}
  onChange={(e) => {
    handleSearch(e.target.value);
  }}
  defaultValue={searchParams.get('query')?.toString()}
/>
```

However, since you're not using state, you can use defaultValue. This means the
native input will manage its own state. This is okay since you're saving the
search query to the URL instead of state. 

* Updating the table with the page component's search params

Our page component accepts a prop called `searchParams` so we can pass the
current URL params to the <Table> component that <Search> is updating via the
client.

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  ...
}
```

If you navigate to the <Table> component, you'll see that the two props, query
and currentPage, are passed to the `fetchFilteredInvoices` function which is a
sql function returning the invoices that match the query.

* When to use the useSearchParams() hook vs. the searchParams prop?

You might have noticed you used two different ways to extract search params.
They depend on whether you're working on the client or the server.

- <Search> (RCC) uses useSearchParams hook to access params from the client
- <Table> (RSC) uses searchParams prop coming from its parenting invoice page

As a general rule, if you want to read the params from the client, use the
useSearchParams() hook as this avoids having to go back to the server. 

* Best practice: Debouncing

You've implemented search with Next.js! But there's something you can do to
optimize it. Inside your handleSearch function console.log:

```tsx
/app/ui/search.tsx
function handleSearch(term: string) {
  console.log(`Searching... ${term}`);
 
  const params = new URLSearchParams(searchParams);
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}
```

Then type "Emil" into your search and check the console in dev tools.

Searching... E Searching... Em Searching... Emi Searching... Emil

You're updating the URL on every keystroke, and therefore querying your database
on every keystroke! Not a problem for small apps. But imagine thousands of
users, each sending a requests to your database, on each keystroke.

Debouncing is a programming practice that limits the rate at which function can
fire. In our case, you only want to query the db when users stop typing.

How Debouncing Works:

- Trigger Event: A timer starts when an event like a keystroke occurs
- Wait: If a new event occurs before the timer expires, the timer is reset
- Execution: When the timers countdown end, the debounced function triggered

You can implement debouncing in a few ways, including manually creating your own
debounce function. To keep things simple, use a library called use-debounce.


* Adding pagination

After introducing the search feature, you'll notice the table displays only 6
invoices at a time. This is because the fetchFilteredInvoices sql function in
data.ts returns a maximum of 6 invoices per page.

Adding pagination allows users to navigate through the different pages to view
all the invoices. Let's see how you can implement pagination using URL params!

Navigate to the <Pagination> component and you'll notice that it's a RCC. You
don't want to fetch data on the client as this would expose secrets (remember,
you're not using an API layer). Instead, you can fetch the data on the server,
and pass it to the component as a prop.

In /dashboard/invoices/page.tsx, import a new function called fetchInvoicesPages
and pass the query from searchParams as an argument:

`fetchInvoicesPages` returns the total number of pages based on the search
query. For example, if there are 12 invoices that match the search query, and
each page displays 6 invoices, then the total number of pages would be 2.

Navigate to the <Pagination> and import usePathname and useSearchParams hooks.
We will use this to get the current page and set the new page. Make sure to also
uncomment the code in this component. Your application will break temporarily as
you haven't implemented the <Pagination/> logic yet. Let's do that now!

```tsx
/app/ui/invoices/pagination.tsx

'use client';
 
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx'; import Link from 'next/link'; import {
generatePagination } from '@/app/lib/utils'; import { usePathname,
useSearchParams } from 'next/navigation';
 
export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname(); const searchParams = useSearchParams(); const
  currentPage = Number(searchParams.get('page')) || 1;
 
  // ...
}
```

* Here's a breakdown of what's happening:

- createPageURL creates an instance of the current search parameters
- Then, it updates the "page" parameter to the provided page number
- Finally, it constructs the full URL using pathname and updated search params

The rest of the <Pagination> component deals with styling and different states
(first, last, active, disabled, etc).

Finally, when the user types a new search query, you want to reset the page
number to 1. Update the handleSearch function in your <Search> component:

```tsx
const handleSearch = useDebouncedCallback((term) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', '1');
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}, 300);
```

- You handled search and pagination with URL search parameters instead of state.
- You've fetched data on the server.
- Using the useRouter router hook for smoother, client-side transitions.

These patterns are different from what you may be used to when working with
client-side React, but hopefully, you now better understand the benefits of
using URL search params and lifting this state to the server. */
