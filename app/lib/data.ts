import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';

import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in real life :)
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await sql<Revenue>`SELECT * FROM revenue`;
    console.log('Data fetch complete after 3 seconds.');
    // Now open http://localhost:3000/dashboard/ in a new tab and notice how the
    // page takes longer to load. Which brings us to a common challenge. With
    // dynamic rendering, an app is only as fast as your slowest data fetch.
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    /* Choosing how to fetch data (Chapter 7) cont.
    https://nextjs.org/learn/dashboard-app/fetching-data#what-are-request-waterfalls

    A "waterfall" refers to a sequence of network requests that depend on the
    completion of previous requests. In the case of data fetching, each request
    can only begin once the previous request has returned data.

    ```
    const revenue = await fetchRevenue();
    const latestInvoices = await fetchLatestInvoices(); // wait for fetchRevenue() to finish
    const {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices,
    } = await fetchCardData(); // wait for fetchLatestInvoices() to finish
    ```

    This pattern is not necessarily bad.
    
    There may be cases where you want waterfalls because you want a condition to
    be satisfied before you make the next request.

    However, this behavior can also be unintentional and impact performance. A
    common way to avoid waterfalls is to initiate all data requests at the same
    time - in parallel. In JS, you can use the Promise.all or Promise.allSettled
    functions to initiate all promises at the same time.

    With allSettled, you can also return an array of objects with status and
    value keys, so can check a promise's status is fulfilled or rejected before
    passing the value to your component. Useful to handle errors gracefully.

    Using this pattern, you can:
    
    Start executing all data fetches at the same time, which can lead to
    performance gains, using native JS patterns in your framework :). */

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  // Static and Dynamic Rendering (Chapter 8) cont.
  // All that is need is to add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    const data = await sql<CustomersTable>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * from USERS where email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

/* Static and Dynamic Rendering (Chapter 8)
https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering

* What is Static Rendering? (SSG)

With static rendering, data fetching and rendering happens on the server at
build time (when you deploy) or during `revalidation`. The result can then be
distributed and cached (stored) in a Content Delivery Network (CDN).

There are a couple of benefits of static rendering:

Faster Websites - Pre-rendered content can be cached. This ensures users can
access your website's content more quickly and reliably.

Reduced Server Load - Because the content is cached, your server does not have
to dynamically generate content for each user request.

SEO - Pre-rendered content is easier for search engine crawlers to index, as the
content is already available when the page loads, improves engine rankings. 

Static rendering is useful for UI with no data or data that is shared across
users, such as a static blog post or a product page. It might not be a good fit
for a dashboard that has data that is regularly updated and changing.

The opposite of static site generated is dynamic rendering, see below.

* What is Dynamic Rendering? (SSR)

With dynamic rendering, content is rendered on the server for each user at
request time (when the user visits the page).

There are a couple of benefits of dynamic rendering:

Real-Time Data - Dynamic rendering allows your application to display real-time
or frequently updated data for applications where data changes often. 

User-Specific Content - It's easier to serve user-specific content, personalized
dashboards or user profile, as its updated based on user interaction.

Request Time Information - Dynamic rendering allows you to access information
that can only be known at request time, like cookies or URL search params.

! Making the dashboard dynamic (noStore function above)

Like how caching works with the fetch api, sql actions in server components, by
default `@vercel/postgres` doesn't set its own caching semantics :). This allows
the framework to set its own static and dynamic behavior!

You can use a Next.js API called `unstable_noStore` inside server components or
data fetching functions to opt out of static rendering.

Note: `unstable_noStore` is an experimental API and may change in the future. If
you prefer to use a stable API in your own projects, you can also use the known
Segment Config Option export const dynamic = "force-dynamic". */
