// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {context} from '../models';

export function AllWebUIExtensions():Promise<{[key: string]: string}>;

export function Branches(arg1:string):Promise<Array<string>>;

export function CheckDifference(arg1:string,arg2:string,arg3:string):Promise<number>;

export function Checkout(arg1:string,arg2:string):Promise<boolean>;

export function CurrentBranch(arg1:string):Promise<string>;

export function CurrentRemote(arg1:string):Promise<string>;

export function Fetch(arg1:string,arg2:string):Promise<boolean>;

export function Pull(arg1:string,arg2:string):Promise<boolean>;

export function Remotes(arg1:string):Promise<Array<string>>;

export function SetContext(arg1:context.Context):Promise<void>;
