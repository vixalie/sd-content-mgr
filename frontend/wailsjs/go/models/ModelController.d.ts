// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {entities} from '../models';
import {models} from '../models';
import {context} from '../models';

export function BreakModelFileParts(arg1:string):Promise<Array<string>>;

export function FetchUncachedFileInfo(arg1:string):Promise<entities.FileCache>;

export function GetModelSubCategoryDirs(arg1:string,arg2:string):Promise<Array<string>>;

export function ListModelFiles(arg1:string,arg2:string,arg3:string,arg4:string):Promise<Array<models.SimpleModelDescript>>;

export function RecordFileBaseModel(arg1:string,arg2:string):Promise<void>;

export function RenameModelFile(arg1:string,arg2:string):Promise<void>;

export function SetContext(arg1:context.Context):Promise<void>;
