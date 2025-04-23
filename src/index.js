addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get("id");

  if (!fileId) {
    return new Response("Missing ?id= in URL", { status: 400 });
  }

  const range = request.headers.get("Range");
  let confirmToken = "";

  let response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
  let text = await response.text();

  const confirmMatch = text.match(/confirm=([0-9A-Za-z_]+)&amp;/);
  if (confirmMatch) {
    confirmToken = confirmMatch[1];
  }

  const downloadURL = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;

  const headers = range ? { Range: range } : {};

  const fileResp = await fetch(downloadURL, {
    headers: {
      ...headers,
      "User-Agent": "Mozilla/5.0"
    }
  });

  const respHeaders = new Headers(fileResp.headers);
  return new Response(fileResp.body, {
    status: fileResp.status,
    statusText: fileResp.statusText,
    headers: respHeaders,
  });
}
