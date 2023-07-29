import { entities } from '@wails/go/models';
import { FetchUncachedFileInfo } from '@wails/go/models/ModelController';

export async function loadUncachedFileInfo({ params }): Promise<entities.FileCache> {
  const fileInfo = await FetchUncachedFileInfo(params.fileId);
  return fileInfo;
}
