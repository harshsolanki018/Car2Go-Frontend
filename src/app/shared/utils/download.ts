function sanitizeFilename(name?: string): string {
  if (!name) {
    return '';
  }
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function buildDownloadUrl(url: string, filename?: string): string {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    return '';
  }

  const normalized = trimmed.startsWith('http://') ? `https://${trimmed.slice(7)}` : trimmed;

  if (normalized.startsWith('data:')) {
    return normalized;
  }

  if (!normalized.includes('res.cloudinary.com') || !normalized.includes('/upload/')) {
    return normalized;
  }

  const [base, query] = normalized.split('?');
  const split = base.split('/upload/');
  if (split.length !== 2) {
    return normalized;
  }

  const safeName = sanitizeFilename(filename);
  const transform = safeName ? `fl_attachment:${encodeURIComponent(safeName)}` : 'fl_attachment';
  const downloadBase = `${split[0]}/upload/${transform}/${split[1]}`;
  return query ? `${downloadBase}?${query}` : downloadBase;
}

export function triggerDownload(url: string, filename?: string): boolean {
  const downloadUrl = buildDownloadUrl(url, filename);
  if (!downloadUrl) {
    return false;
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  if (filename) {
    link.download = sanitizeFilename(filename);
  }
  link.rel = 'noopener';
  link.click();
  return true;
}
