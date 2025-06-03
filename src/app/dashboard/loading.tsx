import { Skeleton } from "@/components/ui/skeleton";
// import Header from "@/components/Header"; // Removed Header from loading state

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <Header /> */} {/* Header will be rendered by the actual DashboardPage */}
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Skeleton className="h-8 w-1/3 mb-6 mt-16" /> {/* Added margin top to simulate header space */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="min-w-[150px] p-4 rounded-md bg-muted/50">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
