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

