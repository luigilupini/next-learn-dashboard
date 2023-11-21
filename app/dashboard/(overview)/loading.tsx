import DashboardSkeleton from '../../ui/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}

/* Streaming (Chapter 9)

https://nextjs.org/learn/dashboard-app/streaming

Streaming is a data transfer technique that allows you to break down a route
into smaller "chunks" and progressively stream them from the server to the
client as they become ready.

By streaming, you can prevent slow data requests from "blocking" your whole
page. Allowing a user to see and interact with parts of the page without waiting
for all the data to load before any UI can be shown to the user.

Streaming works well with React's component model, as each component can be
considered a chunk. There two ways you can streaming in Next.js:

1) At the page level, with the `loading.tsx` file
2) A specific components, with `<Suspense> `component.

Which brings to a common challenge developers face with dynamic rendering (SSR)
is that your application is only as fast as your slowest data fetch.

A `loading.tsx` is a special Next.js file built on top of React Suspense, it
allows you to create fallback UI to show a replacement while page content loads.
Since <Sidebar> is static, and shown immediately. The user can interact with it
while the dynamic content is loading. The user doesn't have to wait for the page
to finish loading before navigating away (known as interruptive navigation).

A loading skeleton is a simplified version of the UI. Many websites use them as
a placeholder (or fallback) to indicate to users that content is loading. Any UI
you embed into loading.tsx will be embedded as part of the static file, and sent
first. Then, the rest of the dynamic content will be streamed from the server to
the client. Use the <DashboardSkeleton> in app/dashboard/loading.tsx.

Right now, your skeleton will apply to the invoices and customers pages as well.

Since loading.tsx is higher than /invoices/page.tsx and /customers/page.tsx in
the file system, it's also applied to those pages.

* We can change this with Route Groups.

Create a new folder called /(overview) inside the dashboard folder. Then, move
your loading.tsx and page.tsx files inside the folder:

Folder structure showing how to create a route group using parentheses Now, the
loading.tsx file will only apply to your dashboard overview page.

Route groups allow you to organize files into logical groups without affecting
the URL path structure. When you create a new folder using parentheses ().

- The name won't be included in the URL path.
- Meaning /dashboard/(overview)/page.tsx becomes /dashboard.

Here, you're using a route group to ensure loading.tsx only applies to your
dashboard overview page. However, you can also use route groups to separate your
application in sections (marketing) & (shop) routes or by teams for larger apps.


* Streaming a component

So far, you're streaming a whole page. But, instead, you can be more granular
and stream specific components using React Suspense.

Suspense allows you to defer rendering parts of your application until some
condition is met (e.g. data is loaded). You can wrap your dynamic components in
Suspense. Then, pass a fallback component to show while dynamic component loads.

Remember the slow data request in fetchRevenue(), well this is the request that
is slowing down the whole page. Instead of blocking your whole page, Suspense to
stream only this component, immediately showing the rest of the page UI.

! Remove data fetching at the page level, and move it to the component :)

To do so, you'll need to move the data fetch to the component, this ensures that
loading skeleton is shown for that component only, not the whole page.

* Deciding where to place your Suspense boundaries

Where you place your Suspense boundaries will depend on a few things:

1) How you want the user to experience the page as it streams.
2) What content you want to prioritize.
3) If the components rely on data fetching.

Don't worry. There isn't a right answer.

- You could stream the whole page like we did with loading.tsx... but that may
  lead to a longer loading time if one component has a slow data fetch.

- You could stream every component individually... but that may lead to UI
  popping into the screen as it becomes ready.

- You could also create a staggered effect by streaming page sections. But
  you'll need to create a parent wrapper component.

Where you place your suspense boundaries will vary depending on your app. In
general, it's good practice to move your data fetches down to the components
that need it, and then wrap those components in Suspense.

But there is nothing wrong with streaming the sections or the whole page if
that's what your application needs. 

* Summary, you've done a few things to optimize data fetching in your app!

- Created a database in the same region as your application code to reduce
  latency between your server and database.
- Fetched data on the server with React Server Components. This allows you to
  keep expensive data fetches and logic on the server, reduces the client-side
  JS bundle, and prevents your database secrets from being exposed.
- Used SQL to only fetch the data you needed, reducing data transferred for each
  request and the amount of JS needed to transform the data in-memory.
- Parallelize data fetching with JS - where it made sense to do so.
- Implemented Streaming to prevent slow data requests from blocking your whole
  page. A user can interact with UI without waiting for everything to load.
- Move data fetching down to the components that need it, thus isolating which
  parts of your routes should be dynamic. Preparation for Partial Pre-rendering.

In the next chapter, we'll look at two common patterns you might need to
implement when fetching data: search and pagination. */
