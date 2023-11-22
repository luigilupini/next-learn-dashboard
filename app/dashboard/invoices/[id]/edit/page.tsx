import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/invoices/edit-form';

import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) notFound();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}

/* Mutating Data (Chapter 12) cont.

https://nextjs.org/learn/dashboard-app/mutating-data

* Updating an invoice

The updating invoice form is similar to the create an invoice form, except
you'll need to pass an invoice id to update the record in your database. Let's
see how you can get and pass the invoice id to be updated.

These are the steps you'll take to update an invoice:

1. Create a Dynamic Route Segment with the invoice id

Next.js allows you to create Dynamic Route Segments when you don't know the
exact segment name and want to create routes based on data. This could be blog
post titles, product pages, etc. You can create dynamic route segments wrapping
a folder's name in square brackets. For example, [id], [post] or [slug].

In your /invoices folder, create a new dynamic route called [id], with a new
route called /edit that has a page.tsx file: 

Example: /invoices/[id]/edit/page.tsx.

In your <Table> notice there's a <UpdateInvoice> button that receives the
invoice's id from the table records. Ensure it updates the href of the Link to
accept the id prop. Use template literals to link to a dynamic route segment:

```tsx
export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className='rounded-md border p-2 hover:bg-gray-100'
    >
      <PencilIcon className='w-5' />
    </Link>
  );
}
```

2. Read the invoice id from page params

Back on your <Page> component, paste the following code:

```tsx
// /app/dashboard/invoices/[id]/edit/page.tsx
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
```

Notice how it's similar to your /create invoice page, except it imports a
different form (edit-form.tsx file). This form should be pre-populated with a
defaultValue for the customer's name, invoice amount, and status.

To pre-populate the form fields, fetch the specific invoice using id.

In addition to searchParams your page components also accept a prop called
params which you can use to access the id.

Update your <Page> component to receive the prop:

```tsx
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  // ...
}
```

3. Fetch the specific invoice

- Import a new function called fetchInvoiceById and pass the id as an argument.
- Import fetchCustomers to fetch the customer names for the dropdown.

You can use Promise.all to fetch both the invoice and customers in parallel:

```tsx
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
 
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  // ...
}
```
Great! Now, test that everything is wired correctly. Visit dashboard/invoices
and click on the Pencil icon to edit an invoice.

A URL should update with an id as follows: dashboard/invoice/uuid/edit.

4. Pass the id to the Server Action

Lastly, you want to pass the id to the Server Action so you can update the right
record in your database. You cannot pass the id as an argument like so ❌:

```tsx
// Passing an id as argument won't work
<form action={updateInvoice(id)}>
```
Instead, you can pass id to the Server Action using JS bind. This will ensure
that any values passed to the Server Action are encoded.

Then, in your actions.ts file, create a new action, updateInvoice:

```ts
// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

Similarly to the createInvoice action, here you are:

- Extracting the data from formData.
- Validating the types with Zod.
- Converting the amount to cents.
- Passing the variables to your SQL query.
- Calling revalidatePath to clear the client cache and make a new server request.
- Calling redirect to redirect the user to the invoice's page.

Test it out by editing an invoice. After submitting the form, you should be
redirected to the invoices page, and the invoice should be updated.
*/
