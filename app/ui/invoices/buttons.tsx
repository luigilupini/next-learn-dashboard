import { deleteInvoice } from '@/app/lib/actions';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateInvoice() {
  return (
    <Link
      href='/dashboard/invoices/create'
      className='flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
    >
      <span className='hidden md:block'>Create Invoice</span>{' '}
      <PlusIcon className='h-5 md:ml-4' />
    </Link>
  );
}

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

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);
  return (
    <form action={deleteInvoiceWithId}>
      <button className='rounded-md border p-2 hover:bg-gray-100'>
        <span className='sr-only'>Delete</span>
        <TrashIcon className='w-5' />
      </button>
    </form>
  );
}
/* Mutating Data (Chapter 12) cont.

https://nextjs.org/learn/dashboard-app/mutating-data

* Deleting an invoice

To delete an invoice using a Server Action, wrap the delete button in a <form>
element and pass the id to the Server Action using bind.

Inside your actions.ts file, create a new action called deleteInvoice.

```tsx
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
```
Since this action is being called in the /dashboard/invoices path, you don't
need to call redirect. 

Calling revalidatePath triggers a new server request and re-render the table.

You learned how to use Server Actions to mutate data.

You also learned how to use the revalidatePath API to revalidate the Next.js
cache and redirect to redirect the user to a new page. */
