export type CacheStatus = 'unknown' | 'cached' | 'not-cached';
export type DownloadStatus = 'unknown' | 'downloaded' | 'not-downloaded';
export type FoundStatus = 'unknown' | 'found' | 'not-found';
export type FileScanStatus = 'unknown' | 'scanned' | 'not-scanned';

export type ElementPosition = {
  x: number;
  y: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

export const InitialElementPosition: ElementPosition = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0
};
