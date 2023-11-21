import { lusitana } from '@/app/ui/fonts';
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from '../lib/data';
import { Card } from '../ui/dashboard/cards';
import LatestInvoices from '../ui/dashboard/latest-invoices';
import RevenueChart from '../ui/dashboard/revenue-chart';

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <Card title='Collected' value={totalPaidInvoices} type='collected' />
        <Card title='Pending' value={totalPendingInvoices} type='pending' />
        <Card title='Total Invoices' value={numberOfInvoices} type='invoices' />
        <Card title='Customers' value={numberOfCustomers} type='customers' />
      </div>
      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
/* Choosing how to fetch data (Chapter 7)
https://nextjs.org/learn/dashboard-app/fetching-data

* API layer

APIs are an intermediary layer between your application code and database. There
are a few cases where you might use an API:

- If you're using 3rd party services that provide an API.
- If you're fetching data from the client, you want to have an API layer.
- This runs on the server to avoid exposing your secrets to the client.
- In Next.js, you can create API endpoints using `Route Handlers`.

* Database queries

When you're creating a full-stack application, you'll also need to write logic
to interact with your database. For relational databases like Postgres, you can
do this with SQL, or an ORM like Prisma.

There are a few cases where you have to write database queries:

- When creating API endpoints you need to write logic to interact with a db.
- If you are using server components, you can skip the API layer.
- Instead we query the db directly without exposing secrets to clients.

We'll explore how to fetch data using a the async RSC approach.

* Using Server Components to fetch data

By default, Next.js applications use React Server Components, and you can opt in
Client Components when needed. Here are benefits fetching data with RSCs:

- Server Components execute on the server, so you can keep expensive data
fetches and logic on the server and only send the result to the client.

- Server Components support promises providing a solution for async tasks like
data fetching. You can use `async/await` syntax without reaching out for
`useEffect`, `useState` or data fetching libraries.

- RSCs execute on the server, you can query the database directly without an
additional API layer. See below examples! 

* Using SQL functions in Server Components (cont.)

Here we use the Vercel Postgres SDK and SQL. SQL is versatile, allowing you to
fetch and manipulate specific data.

The Vercel Postgres SDK provides protection against SQL injections.

You can call `sql` inside any Server Component. But to allow you to navigate the
components more easily, all data queries in the `data.ts` file, & you can import
them into any server component. Let's fetch data for this dashboard page. 

The Page is an async component. This allows you to use `await` to fetch data.
These components receive data: <Card>, <RevenueChart>, and <LatestInvoices>. 

Example <LatestInvoices> will get the latest 5 invoices, sorted by date.

You could fetch all the invoices and sort through them using JS. This isn't a
problem as our data is small, but as a application grows, it can significantly
increase the amount of data transferred on each request and the JS required to
sort through it and that is not ideal.

Instead of sorting through the latest invoices in-memory, you can use an SQL
query to fetch only the last 5 invoices.

Check the SQL query in `data.ts`: 

// /app/lib/data.ts (fetchLatestInvoices)
const data = await sql<LatestInvoiceRaw>`
  SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
  FROM invoices
  JOIN customers ON invoices.customer_id = customers.id
  ORDER BY invoices.date DESC
  LIMIT 5`;
//...

Example fetch data for <Card> components

These cards will display the total amount of invoices collected. Total amount of
invoices pending. Total number of invoices. Total number of customers.

Again, you might be tempted to fetch all the invoices and customers, and use JS
to manipulate the data. For example, you could use Array.length to get the total
number of invoices and customers etc.

// Fetch all invoices and customers ❌
const totalInvoices = allInvoices.length;
const totalCustomers = allCustomers.length;
// ...

But with SQL, you can fetch only the data you need.

It's a little more coding than using Array.length, but it means less data needs
to be transferred when the client requests this page component.

// /app/lib/data.ts (fetchCardData)
const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
const invoiceStatusPromise = sql`SELECT
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    FROM invoices`;
...

The function you will need to import is called fetchCardData. */
