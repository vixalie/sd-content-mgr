export namespace config {
	
	export class A111StableDiffusionWebUIConfig {
	    basePath: string;
	    checkpoint: string;
	    configuration: string;
	    lora: string;
	    locon: string;
	    vae: string;
	    embedding: string;
	    hypernet: string;
	    controlnet: string;
	    esrgan: string;
	    realEsrgan: string;
	    swinIR: string;
	
	    static createFrom(source: any = {}) {
	        return new A111StableDiffusionWebUIConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.basePath = source["basePath"];
	        this.checkpoint = source["checkpoint"];
	        this.configuration = source["configuration"];
	        this.lora = source["lora"];
	        this.locon = source["locon"];
	        this.vae = source["vae"];
	        this.embedding = source["embedding"];
	        this.hypernet = source["hypernet"];
	        this.controlnet = source["controlnet"];
	        this.esrgan = source["esrgan"];
	        this.realEsrgan = source["realEsrgan"];
	        this.swinIR = source["swinIR"];
	    }
	}
	export class ComfyUIConfig {
	    basePath: string;
	    checkpoint: string;
	    clip: string;
	    clipVision: string;
	    configuration: string;
	    diffuser: string;
	    embedding: string;
	    gligen: string;
	    hypernet: string;
	    lora: string;
	    locon: string;
	    styles: string;
	    unet: string;
	    upscaler: string;
	    vae: string;
	    controlnet: string;
	    extraModelPathsFile: string;
	
	    static createFrom(source: any = {}) {
	        return new ComfyUIConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.basePath = source["basePath"];
	        this.checkpoint = source["checkpoint"];
	        this.clip = source["clip"];
	        this.clipVision = source["clipVision"];
	        this.configuration = source["configuration"];
	        this.diffuser = source["diffuser"];
	        this.embedding = source["embedding"];
	        this.gligen = source["gligen"];
	        this.hypernet = source["hypernet"];
	        this.lora = source["lora"];
	        this.locon = source["locon"];
	        this.styles = source["styles"];
	        this.unet = source["unet"];
	        this.upscaler = source["upscaler"];
	        this.vae = source["vae"];
	        this.controlnet = source["controlnet"];
	        this.extraModelPathsFile = source["extraModelPathsFile"];
	    }
	}
	export class ProxyConfig {
	    useProxy: boolean;
	    protocol: string;
	    host: string;
	    port?: number;
	    user?: string;
	    password?: string;
	
	    static createFrom(source: any = {}) {
	        return new ProxyConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.useProxy = source["useProxy"];
	        this.protocol = source["protocol"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.user = source["user"];
	        this.password = source["password"];
	    }
	}

}

export namespace entities {
	
	export class CivitaiCreator {
	    username: string;
	    image?: string;
	
	    static createFrom(source: any = {}) {
	        return new CivitaiCreator(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.image = source["image"];
	    }
	}
	export class Image {
	    id: string;
	    versionId?: number;
	    modelVersion?: ModelVersion;
	    fileName: string;
	    blurHash: string;
	    fingerprint?: string;
	    localPath?: string;
	    width?: number;
	    height?: number;
	    size?: number;
	    nsfw?: number;
	    meta?: {[key: string]: any};
	
	    static createFrom(source: any = {}) {
	        return new Image(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.versionId = source["versionId"];
	        this.modelVersion = this.convertValues(source["modelVersion"], ModelVersion);
	        this.fileName = source["fileName"];
	        this.blurHash = source["blurHash"];
	        this.fingerprint = source["fingerprint"];
	        this.localPath = source["localPath"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.size = source["size"];
	        this.nsfw = source["nsfw"];
	        this.meta = source["meta"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ModelTags {
	    modelId: number;
	    tag: string;
	
	    static createFrom(source: any = {}) {
	        return new ModelTags(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.modelId = source["modelId"];
	        this.tag = source["tag"];
	    }
	}
	export class Model {
	    id: number;
	    name: string;
	    description?: string;
	    author?: CivitaiCreator;
	    nsfw?: boolean;
	    poi?: boolean;
	    type: string;
	    mode?: string;
	    // Go type: time
	    lastSyncedAt?: any;
	    tags: ModelTags[];
	    versions: ModelVersion[];
	
	    static createFrom(source: any = {}) {
	        return new Model(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.author = this.convertValues(source["author"], CivitaiCreator);
	        this.nsfw = source["nsfw"];
	        this.poi = source["poi"];
	        this.type = source["type"];
	        this.mode = source["mode"];
	        this.lastSyncedAt = this.convertValues(source["lastSyncedAt"], null);
	        this.tags = this.convertValues(source["tags"], ModelTags);
	        this.versions = this.convertValues(source["versions"], ModelVersion);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ModelVersion {
	    id: number;
	    modelId?: number;
	    model?: Model;
	    versionName: string;
	    activatePrompt: string[];
	    baseModel?: string;
	    pageUrl?: string;
	    // Go type: time
	    downloadedAt?: any;
	    // Go type: time
	    lastSyncedAt?: any;
	    coverUsed?: string;
	    covers: Image[];
	    gallery: string[];
	    // Go type: time
	    civitaiCreatedAt?: any;
	    // Go type: time
	    civitaiUpdatedAt?: any;
	
	    static createFrom(source: any = {}) {
	        return new ModelVersion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.modelId = source["modelId"];
	        this.model = this.convertValues(source["model"], Model);
	        this.versionName = source["versionName"];
	        this.activatePrompt = source["activatePrompt"];
	        this.baseModel = source["baseModel"];
	        this.pageUrl = source["pageUrl"];
	        this.downloadedAt = this.convertValues(source["downloadedAt"], null);
	        this.lastSyncedAt = this.convertValues(source["lastSyncedAt"], null);
	        this.coverUsed = source["coverUsed"];
	        this.covers = this.convertValues(source["covers"], Image);
	        this.gallery = source["gallery"];
	        this.civitaiCreatedAt = this.convertValues(source["civitaiCreatedAt"], null);
	        this.civitaiUpdatedAt = this.convertValues(source["civitaiUpdatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FileCache {
	    id: string;
	    fullPath: string;
	    fileHash: string;
	    fileName: string;
	    thumbnailPath?: string;
	    infoPath?: string;
	    fileSize: number;
	    crc: string;
	    memo?: string;
	    additionalPrompts: string[];
	    baseModel?: string;
	    relatedModelVersionId?: number;
	    relatedModel?: ModelVersion;
	
	    static createFrom(source: any = {}) {
	        return new FileCache(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.fullPath = source["fullPath"];
	        this.fileHash = source["fileHash"];
	        this.fileName = source["fileName"];
	        this.thumbnailPath = source["thumbnailPath"];
	        this.infoPath = source["infoPath"];
	        this.fileSize = source["fileSize"];
	        this.crc = source["crc"];
	        this.memo = source["memo"];
	        this.additionalPrompts = source["additionalPrompts"];
	        this.baseModel = source["baseModel"];
	        this.relatedModelVersionId = source["relatedModelVersionId"];
	        this.relatedModel = this.convertValues(source["relatedModel"], ModelVersion);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class ModelFileHashes {
	    AutoV1?: string;
	    AutoV2?: string;
	    SHA256?: string;
	    CRC32?: string;
	    BLAKE3?: string;
	
	    static createFrom(source: any = {}) {
	        return new ModelFileHashes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AutoV1 = source["AutoV1"];
	        this.AutoV2 = source["AutoV2"];
	        this.SHA256 = source["SHA256"];
	        this.CRC32 = source["CRC32"];
	        this.BLAKE3 = source["BLAKE3"];
	    }
	}
	export class ModelFileMeta {
	    fp?: string;
	    size?: string;
	    format?: string;
	
	    static createFrom(source: any = {}) {
	        return new ModelFileMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fp = source["fp"];
	        this.size = source["size"];
	        this.format = source["format"];
	    }
	}
	export class ModelFile {
	    id: number;
	    versionId: number;
	    modelVersion?: ModelVersion;
	    name: string;
	    size: number;
	    type?: string;
	    identityHash: string;
	    metadata?: ModelFileMeta;
	    hashes?: ModelFileHashes;
	    primary?: boolean;
	    localFile?: FileCache;
	
	    static createFrom(source: any = {}) {
	        return new ModelFile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.versionId = source["versionId"];
	        this.modelVersion = this.convertValues(source["modelVersion"], ModelVersion);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.type = source["type"];
	        this.identityHash = source["identityHash"];
	        this.metadata = this.convertValues(source["metadata"], ModelFileMeta);
	        this.hashes = this.convertValues(source["hashes"], ModelFileHashes);
	        this.primary = source["primary"];
	        this.localFile = this.convertValues(source["localFile"], FileCache);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	

}

export namespace models {
	
	export class SimpleModelDescript {
	    id: string;
	    name: string;
	    versionName: string;
	    filePath: string;
	    type?: string;
	    thumbnailPath?: string;
	    fileHash: string;
	    activatePrompt: string[];
	    memo?: string;
	    baseModel?: string;
	    related: boolean;
	    relatedModel?: number;
	    relatedVersion?: number;
	
	    static createFrom(source: any = {}) {
	        return new SimpleModelDescript(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.versionName = source["versionName"];
	        this.filePath = source["filePath"];
	        this.type = source["type"];
	        this.thumbnailPath = source["thumbnailPath"];
	        this.fileHash = source["fileHash"];
	        this.activatePrompt = source["activatePrompt"];
	        this.memo = source["memo"];
	        this.baseModel = source["baseModel"];
	        this.related = source["related"];
	        this.relatedModel = source["relatedModel"];
	        this.relatedVersion = source["relatedVersion"];
	    }
	}
	export class SimplifiedModelVersion {
	    id: number;
	    versionName: string;
	
	    static createFrom(source: any = {}) {
	        return new SimplifiedModelVersion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.versionName = source["versionName"];
	    }
	}

}

