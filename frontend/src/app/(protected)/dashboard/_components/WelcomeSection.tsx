import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeSectionProps {
  firstName?: string;
}

export function WelcomeSection({ firstName }: WelcomeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          🎉 Welcome to your Dashboard{firstName ? `, ${firstName}` : ""}!
        </CardTitle>
        <CardDescription>
          You've successfully authenticated using tRPC and JWT tokens. This dashboard demonstrates:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Type-safe API calls with tRPC and React Query</li>
          <li>JWT-based authentication with automatic token management</li>
          <li>Protected routes that redirect unauthenticated users</li>
          <li>Modern Next.js 15 app structure with server and client components</li>
          <li>Real-time data fetching and caching</li>
          <li>shadcn/ui components with Tailwind CSS styling</li>
        </ul>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">✨</div>
            <div>
              <h4 className="font-semibold text-primary mb-1">This is a clean template!</h4>
              <p className="text-sm text-muted-foreground">
                You can use this as a starting point for your own tRPC applications. The template
                includes authentication, user management, and a solid foundation for building
                type-safe full-stack applications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            Next.js 15
          </div>
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            tRPC
          </div>
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            React Query
          </div>
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            TypeScript
          </div>
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            shadcn/ui
          </div>
          <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            Tailwind CSS
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
