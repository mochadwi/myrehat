"use client";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔═██╗██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`;

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Hero section */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book homestays directly with hosts
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Browse homestay listings and contact hosts via WhatsApp
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="rounded-lg border p-6 hover:bg-white transition-shadow shadow-sm"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">Featured</h3>
            <p className="text-gray-500 text-sm">
              Discover beautiful homestay listings curated for you.
            </p>
          </div>

          <div
            className="rounded-lg border p-6 hover:bg-white transition-shadow shadow-sm"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">Explore</h3>
            <p className="text-gray-500 text-sm">
              Browse by category or location.
            </p>
          </div>

          <div
            className="rounded-lg border p-6 hover:bg-white transition-shadow shadow-sm"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">Wishlist</h3>
            <p className="text-gray-500 text-sm">
              Save your favorite homestays.
            </p>
          </div>
        </div>

        {/* WA Contact CTA */}
        <section className="mt-8 pt-8 border-t bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-full text-lg font-medium hover:bg-green-700 transition-colors"
            >
              Contact Host via WhatsApp
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Send WhatsApp message to hosts
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}