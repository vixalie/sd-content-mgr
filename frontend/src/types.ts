export type CacheStatus = 'unknown' | 'cached' | 'not-cached';
export type DownloadStatus = 'unknown' | 'downloaded' | 'not-downloaded';
export type FoundStatus = 'unknown' | 'found' | 'not-found';

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
