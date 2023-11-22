import { fetchCustomers } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/invoices/create-form';

export default async function Page() {
  const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}

/* Mutating Data (Chapter 12)

https://nextjs.org/learn/dashboard-app/mutating-data

You implemented search and pagination using URL searchParams from the Next API
to "read" invoices. Let's continue working on the CRUD operations so that we can
create, update, and delete invoices! What we going to cover:

- React Server Actions are and how to use them to mutate data.
- Work with forms in Server Components.
- Best practices working with the native formData objects including validation.
- How to revalidate the client cache using the `revalidatePath` API.
- How to create dynamic route segments with specific IDs.
- How to use the React’s `useFormStatus` hook for optimistic updates.

> What are Server Actions?

React Server Actions (RSA) allow you to run asynchronous code directly on the
server. They eliminate the need to create API endpoints in mutating your data.
Instead you write async functions that execute on the server.

! They invoked from either React Client or Server Components.

Security is a top priority for web applications, as they can be vulnerable to
various threats. This is where Server Actions come in. They offer an effective
security solution, protecting against different types of attacks, securing your
data, and ensuring authorized access.

Server Actions achieve this through techniques like POST requests, encrypted
closures, strict input checks, error message hashing, and host restrictions, all
working together to significantly enhance your app's safety.

Using forms with Server Actions In React, you can use the action attribute in
the <form> element to invoke actions. The action will automatically receive the
native FormData object, containing the captured data.

```tsx
// Server Component
export default function Page() {
  // Action
  const create = (formData: FormData) => {
    'use server';
    // Logic to mutate data...
  }
  // Invoke the action using the "action" attribute
  return <form action={create}>...</form>;
}
```

An advantage of invoking a Server Action within a RSC is progressive
enhancement. The forms work even if JavaScript is disabled on the client.

> Next.js with Server Actions

Server Actions are also deeply integrated with Next caching. When a form is
submitted through a Server Action. So not only can you use the action to mutate
data, but you can also revalidate the associated cache for a route. We do this
by using Next API `revalidatePath` and `revalidateTag`.

* Creating an invoice

Here are the steps you'll take to create a new invoice:

- Create a form to capture the user's input.
- Create a Server Action and invoke it from the form.
- Inside your Server Action, extract the data from the formData object.
- Validate and prepare the data to be inserted into your database.
- Insert the data and handle any errors.
- Revalidate the cache and redirect the user back to invoices page.

1. Create a new route and form

To start, inside the /invoices folder, add a new route segment called /create
with a page.tsx file. You'll be using this route to create new invoices.


This page is a Server Component that fetches customers and passes it to the
<Form> component. Navigate to <Form>, and you'll see that the form:

- Has one <select> (dropdown) element with a list of customers.
- Has one <input> element for the amount with type="number".
- Has two <input> elements for the status with type="radio".
- Has one button with type="submit".

Open http://localhost:3000/dashboard/invoices/create

2. Create a Server Action

A Server Action that is going to be called when the form is submitted.

Navigate to your lib directory and create a new file named actions.ts. At the
top of this file, add the React `use server` directive:

```tsx
/app/lib/actions.ts

'use server';
 
export async function createInvoice(formData: FormData) {}
```

By adding the 'use server', you mark all the exported functions within the file
as server functions. These server functions can then be imported into Client and
Server components, making them extremely versatile.

You can also write Server Actions directly inside Server Components by adding
"use server" inside the action. But organized in a separate file.

Then, in your <Form> component, import the createInvoice action. Add a action
attribute to the <form> html element, and call the createInvoice action.

Good to know: In HTML, you'd pass a URL to the action attribute. This URL would
be the destination your form data should be submitted (usually an API endpoint).

However, in React, the `action` attribute is considered a special prop - meaning
React builds on top of it to allow actions to be invoked.

Behind the scenes, Server Actions create a POST API endpoint. This is why you
don't need to create API endpoints manually when using Server Actions.

3. Extract the data from formData

Back in your actions.ts file, extract the values of formData, there are a couple
of methods you can use. For this example, let's use the .get(name) method.

```tsx
'use server';
 
export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // Test it out:
  console.log(rawFormData);
}
```

4. Validate and prepare the data

Before sending the form data to your database, you want to ensure it's in the
correct format and with the correct types. If you remember from earlier in the
course, your invoices table expects data in the following format:

```tsx
export type Invoice = {
  id: string; // Will be created on the database
  customer_id: string;
  amount: number; // Stored in cents
  status: 'pending' | 'paid';
  date: string;
};
```

So far, you only have the customer_id, amount, and status from the form.

> Type validation and coercion

! It's important to validate data from forms align with databases

To handle type validation, you have a few options. While you can manually
validate types, using a type validation library can save you time and effort.

Use Zod, a TypeScript-first validation library! In your actions.ts file, import
Zod and define a schema that matches the shape of your form object. This schema
will validate the formData before saving it to a database.

The amount field is specifically set to coerce (change) from a string to a
number while also validating its type.

You can then pass your rawFormData to CreateInvoice to validate the types:

```ts
'use server';

import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
// Inspired by TypeScript built-in pick and omit utility types, all Zod object
// schemas have .pick and .omit methods that return a modified version. To only
// keep certain keys use pick and to remove certain keys use omit :)
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
 
  const amountInCents = amount * 100; // 👈🏻 storing values in cents
  const date = new Date().toISOString().split('T')[0]; // 👈🏻 creating new dates
}
```

5. Inserting the data into your database

Now that you have all the values you need for your db, you can create an SQL
query to insert the new invoice into your database and pass in the variables:

```ts
import { z } from 'zod';
import { sql } from '@vercel/postgres';
 
// ...
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
}
```

6. Revalidate and redirect

Next has a Client-side Router Cache that stores the route segments in the user's
browser for a period of time. Now with pre-fetching this cache ensures users can
quickly navigate between routes, while reducing the number of server requests.

Since you're updating the data displayed in the invoices route, you want to
clear this cache and trigger a new request to the server. You can do this with
the `revalidatePath` API function from Next.js:

```ts
'use server';
 
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
 
// ...
export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        values (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

  revalidatePath('/dashboard/invoices'); // 👈🏻 revalidate the routes cache
  redirect('/dashboard/invoices'); // 👈🏻 redirect the user
}
```

Once the db has been updated with a created invoice, the /dashboard/invoices
path will be revalidated, meaning data will be fetched from the server.

At this point, you would want to redirect the user back to the invoices page.
You can do this with the `redirect` function from Next. */
