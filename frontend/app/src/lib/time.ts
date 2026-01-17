export function timeAgo(iso: string): string {
const diff = Date.now() - new Date(iso).getTime();
const minutes = Math.floor(diff / 60000);
if (minutes < 1) return "just now";
if (minutes < 60) return `${minutes} min ago`;
const hours = Math.floor(minutes / 60);
return `${hours} hr ago`;
}


