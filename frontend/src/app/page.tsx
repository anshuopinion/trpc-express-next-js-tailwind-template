import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to tRPC Template
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern, type-safe full-stack template with Next.js 15, tRPC, and authentication
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              href="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-2 px-6 rounded-lg border-2 border-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Modern Stack</h3>
            <p className="text-gray-600">
              Built with Next.js 15, tRPC, React Query, and TypeScript for maximum type safety
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Authentication</h3>
            <p className="text-gray-600">
              JWT-based authentication with refresh tokens and protected routes
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">📱 Responsive</h3>
            <p className="text-gray-600">
              Mobile-first design with Tailwind CSS and modern UI components
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}