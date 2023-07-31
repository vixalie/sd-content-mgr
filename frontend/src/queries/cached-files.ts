import { entities, models } from '@wails/go/models';
import { FetchCachedFileInfo, FetchSameSerialVersions } from '@wails/go/models/ModelController';
import { prop } from 'ramda';

export async function loadCachedVersionInfo(params): Promise<entities.ModelVersion> {
  const modelInfo = await FetchCachedFileInfo(parseInt(prop('modelVersionId', params)));
  return modelInfo;
}

export async function loadSameSerialVersions(params): Promise<models.SimplifiedModelVersion> {
  const versions = await FetchSameSerialVersions(parseInt(prop('modelVersionId', params)));
  return versions;
}
