import { entities, models } from '@wails/go/models';
import {
  FetchCachedFileInfo,
  FetchSameSerialVersions,
  IsModelVersionPrimaryFileDownloaded
} from '@wails/go/models/ModelController';
import { prop } from 'ramda';

export async function loadCachedVersionInfo(params): Promise<entities.ModelVersion> {
  const modelInfo = await FetchCachedFileInfo(parseInt(prop('modelVersionId', params)));
  return modelInfo;
}

export async function loadSameSerialVersions(params): Promise<models.SimplifiedModelVersion[]> {
  const versions = await FetchSameSerialVersions(parseInt(prop('modelVersionId', params)));
  return versions;
}

export async function checkModelVersionDownloaded(params): Promise<boolean> {
  return await IsModelVersionPrimaryFileDownloaded(parseInt(prop('modelVersionId', params)));
}
