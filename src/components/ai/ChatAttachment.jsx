// Photo input for the assistant chats: upload an image or take a photo (phone camera or webcam).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Paperclip, RefreshCw, X } from 'lucide-react';

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
  img.src = url;
});

// Shrink big photos (phones take 4000px+) to at most 1600px JPEG so uploads stay fast.
export async function prepareImage(file) {
  if (!file || !/^image\//.test(file.type)) throw new Error('Please choose an image file (JPG, PNG, WebP…).');
  if (file.size > MAX_BYTES) throw new Error('That image is larger than 15 MB. Please choose a smaller one.');
  if (/gif|svg/.test(file.type)) return file;
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return file;
    const name = `${(file.name || 'photo').replace(/\.[^.]+$/, '')}.jpg`;
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// { attachment: {file, url, name}, error, pick(file), clear() }
export function usePhotoAttachment() {
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const pick = useCallback(async (file) => {
    setError('');
    try {
      const prepared = await prepareImage(file);
      setAttachment({ file: prepared, url: URL.createObjectURL(prepared), name: prepared.name });
    } catch (err) {
      setError(err.message);
    }
  }, []);
  // The preview URL stays alive because the sent chat message keeps showing the photo.
  const clear = useCallback(() => { setAttachment(null); setError(''); }, []);
  // Put a sent photo back (the assistant asked "what's wrong?" and will use it with the answer).
  const restore = useCallback((sent) => { if (sent) setAttachment(sent); }, []);
  return { attachment, error, pick, clear, restore };
}

const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

function CameraModal({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [shot, setShot] = useState(null); // { blob, url }
  const [facing, setFacing] = useState('environment');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1600 } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setError('');
      } catch (err) {
        setError(err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in your browser, or use the 📎 button to upload a photo instead.'
          : 'No camera was found on this device. Use the 📎 button to upload a photo instead.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && setShot({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.9);
  };

  const usePhoto = () => {
    onCapture(new File([shot.blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Take a photo">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">Take a photo</div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close camera"><X className="h-5 w-5" /></button>
        </div>
        <div className="relative aspect-[4/3] bg-black">
          {error ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white">{error}</div>
          ) : shot ? (
            <img src={shot.url} alt="Captured" className="h-full w-full object-contain" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          {shot ? (
            <>
              <button type="button" onClick={() => setShot(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Retake</button>
              <button type="button" onClick={usePhoto} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Use photo</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))} disabled={Boolean(error)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                <RefreshCw className="h-4 w-4" /> Switch
              </button>
              <button type="button" onClick={capture} disabled={Boolean(error)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                <Camera className="h-4 w-4" /> Capture
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// 📎 upload + 📷 camera. On phones the camera button opens the native camera app.
export function PhotoButtons({ onPick, disabled = false, className = '' }) {
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const openCamera = () => {
    if (isTouchDevice() || !navigator.mediaDevices?.getUserMedia) cameraRef.current?.click();
    else setCameraOpen(true);
  };
  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onPick(file);
  };
  const btn = 'flex-shrink-0 rounded-xl border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button type="button" onClick={() => uploadRef.current?.click()} disabled={disabled} className={btn} title="Upload a photo" aria-label="Upload a photo">
        <Paperclip className="h-4 w-4" />
      </button>
      <button type="button" onClick={openCamera} disabled={disabled} className={btn} title="Take a photo" aria-label="Take a photo">
        <Camera className="h-4 w-4" />
      </button>
      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      {cameraOpen && <CameraModal onClose={() => setCameraOpen(false)} onCapture={onPick} />}
    </div>
  );
}

export function PhotoPreview({ attachment, error, onRemove }) {
  if (!attachment && !error) return null;
  return (
    <div className="mb-2">
      {attachment && (
        <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2">
          <img src={attachment.url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
          <span className="truncate text-xs font-medium text-slate-700">{attachment.name}</span>
          <button type="button" onClick={onRemove} className="rounded-md p-1 text-slate-500 hover:bg-slate-200" aria-label="Remove photo"><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && <div className="mt-1 text-xs font-medium text-rose-600">{error}</div>}
    </div>
  );
}
