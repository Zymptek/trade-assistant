
export function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="h-8 bg-muted rounded-md w-full"
        />
      ))}
    </div>
  )
}
