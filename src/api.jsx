const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function api(path, options = {}) {
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Some successful responses may not contain JSON.
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function uploadPropertyImage(file) {
  const contentType = file.type || 'application/octet-stream';
  const presign = await api(
    `/api/properties/uploads/presign?contentType=${encodeURIComponent(contentType)}`,
    { method: 'POST' }
  );

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('S3 image upload failed. Check S3 bucket CORS and AWS credentials.');
  }

  // The current backend returns the S3 object key, not a public image URL.
  return presign.key;
}
