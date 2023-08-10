// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {entities} from '../models';
import {models} from '../models';
import {context} from '../models';

export function BreakModelFileParts(arg1:string):Promise<Array<string>>;

export function BreakModelVersionFile(arg1:number):Promise<Array<string>>;

export function CheckFileNameExists(arg1:string,arg2:string,arg3:number,arg4:string):Promise<boolean>;

export function ChooseAndSetFileThumbnail(arg1:string):Promise<boolean>;

export function CopyModelFileLoader(arg1:number):Promise<void>;

export function DeleteFilePrompts(arg1:string,arg2:Array<string>):Promise<void>;

export function FetchCachedFileInfo(arg1:number):Promise<entities.ModelVersion>;

export function FetchDownloadModelVersion(arg1:number):Promise<Array<number>>;

export function FetchModelImage(arg1:string):Promise<entities.Image>;

export function FetchModelInfo(arg1:number):Promise<entities.Model>;

export function FetchModelLocalFiles(arg1:number):Promise<Array<entities.ModelFile>>;

export function FetchModelTags(arg1:number):Promise<Array<string>>;

export function FetchModelVersionDescription(arg1:number):Promise<string>;

export function FetchModelVersionPrimaryFile(arg1:number):Promise<entities.FileCache>;

export function FetchSameSerialVersions(arg1:number):Promise<Array<models.SimplifiedModelVersion>>;

export function FetchUncachedFileInfo(arg1:string):Promise<entities.FileCache>;

export function GetModelSubCategoryDirs(arg1:string,arg2:string):Promise<Array<string>>;

export function IsImageAsThumbnail(arg1:number,arg2:string):Promise<boolean>;

export function IsModelVersionPrimaryFileDownloaded(arg1:number):Promise<boolean>;

export function ListModelFiles(arg1:string,arg2:string,arg3:string,arg4:string):Promise<Array<models.SimpleModelDescript>>;

export function RecordFileBaseModel(arg1:string,arg2:string):Promise<void>;

export function RecordFileMemo(arg1:string,arg2:string):Promise<void>;

export function RecordFilePrompts(arg1:string,arg2:string):Promise<void>;

export function RenameModelFile(arg1:string,arg2:string):Promise<void>;

export function SetContext(arg1:context.Context):Promise<void>;

export function SetModelVersionThumbnail(arg1:number,arg2:string):Promise<void>;
