import { serve } from "bun";

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html
    if (path === "/") {
      path = "/index.html";
    }
    
    // Serve static files
    const file = Bun.file(`${import.meta.dir}${path}`);
    
    return new Response(file);
  },
});

console.log("Client running at http://localhost:3000");