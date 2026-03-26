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

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/upload/')) {
    return trimmed;
  }

  const [base, query] = trimmed.split('?');
  const split = base.split('/upload/');
  if (split.length !== 2) {
    return trimmed;
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
