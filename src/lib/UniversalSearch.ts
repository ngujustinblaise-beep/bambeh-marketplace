export function routeSearch(query: string): string {
  const q = query.toLowerCase();
  if(q.includes("house")) return "/rentals";
  if(q.includes("car"))   return "/vehicles";
  if(q.includes("job"))   return "/jobs";
  if(q.includes("farm"))  return "/farm-fresh";
  return "/search?q=" + encodeURIComponent(query);
}
