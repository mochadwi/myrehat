"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const Categories = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

type Category = (typeof Categories)[number];

type FormState = {
  title: string;
  price: string;
  location: string;
  category: Category;
  whatsapp: string;
};

const emptyForm: FormState = {
  title: "",
  price: "",
  location: "",
  category: Categories[0],
  whatsapp: "",
};

export default function BuyHomestayPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  // Only signed-in users may submit a listing.
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  const listings = useQuery(orpc.listing.list.queryOptions());

  const createListing = useMutation(
    orpc.listing.create.mutationOptions({
      onSuccess: () => {
        setForm(emptyForm);
        setError(null);
        void listings.refetch();
      },
      onError: (err) => setError(err.message),
    }),
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    createListing.mutate({
      title: form.title,
      price: Number(form.price),
      location: form.location,
      category: form.category,
      whatsapp: form.whatsapp,
    });
  };

  if (isPending) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login required</h1>
        <p className="text-gray-600">Redirecting you to the login page…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book homestays directly with hosts
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            List your homestay, or browse what other hosts are selling. Contact them straight on
            WhatsApp.
          </p>
        </header>

        {/* Listing form */}
        <section className="rounded-lg border bg-white p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create a listing</h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Title
              <input
                required
                minLength={3}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Cozy 2-bedroom homestay near Ubud"
                className="rounded-md border px-3 py-2 font-normal text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Price (IDR)
              <input
                required
                type="number"
                min={1}
                step={1}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="750000000"
                className="rounded-md border px-3 py-2 font-normal text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Location
              <input
                required
                minLength={3}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ubud, Bali"
                className="rounded-md border px-3 py-2 font-normal text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="rounded-md border px-3 py-2 font-normal text-gray-900"
              >
                {Categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              WhatsApp contact
              <input
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+628123456789"
                className="rounded-md border px-3 py-2 font-normal text-gray-900"
              />
            </label>

            {error ? (
              <p className="md:col-span-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createListing.isPending}
                className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                {createListing.isPending ? "Saving…" : "Publish listing"}
              </button>
            </div>
          </form>
        </section>

        {/* Listings */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listings</h2>

          {listings.isLoading ? (
            <p className="text-gray-500">Loading listings…</p>
          ) : listings.data && listings.data.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.data.map((item) => (
                <article key={item.id} className="rounded-lg border bg-white p-6 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    {item.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.location}</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                  <a
                    href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Halo, saya tertarik dengan listing "${item.title}" (${item.category})`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Contact via WhatsApp
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No listings yet. Be the first to publish one.</p>
          )}
        </section>
      </div>
    </div>
  );
}
