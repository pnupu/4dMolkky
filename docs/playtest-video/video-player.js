for (const video of document.querySelectorAll('video')) {
  const source = video.querySelector('source[data-src]');
  if (!source) continue;
  const panel = document.createElement('div');
  panel.className = 'video-loader';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Load video';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Loads this short clip before playing, including on mobile. No autoplay.';
  panel.append(button, status);
  video.after(panel);
  let objectUrl;

  button.addEventListener('click', async () => {
    if (objectUrl) {
      try {
        await video.play();
        status.textContent = 'Use the video controls to pause, seek or view full screen.';
      } catch {
        status.textContent = 'Tap Play in the video controls to start playback.';
      }
      return;
    }
    button.disabled = true;
    button.textContent = 'Loading…';
    status.textContent = 'Downloading this clip. Other clips are not downloaded.';
    const request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 30000);
    try {
      const response = await fetch(source.dataset.src, { signal: request.signal });
      if (!response.ok) throw new Error('Video request failed');
      const bytes = await response.arrayBuffer();
      objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
      video.src = objectUrl;
      video.load();
      button.textContent = 'Play video';
      status.textContent = 'Ready. Tap Play video; sound uses your device volume.';
    } catch {
      button.textContent = 'Retry loading video';
      status.textContent = 'Could not load the clip. Check your connection and retry, or use the MP4 download link.';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
  video.addEventListener('error', () => {
    if (!objectUrl) return;
    URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
    video.removeAttribute('src');
    button.textContent = 'Retry loading video';
    status.textContent = 'Playback failed. Retry loading the clip, or download the MP4.';
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted && objectUrl) URL.revokeObjectURL(objectUrl);
  });
}
