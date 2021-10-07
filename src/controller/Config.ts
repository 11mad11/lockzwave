import * as fs from "fs";

export interface ConfigDef {

}

export class Config<ConfigType extends ConfigDef= ConfigDef> {
    public readonly config: ConfigType;
    private readonly path: string;
    
    constructor(path: string = "./config.json") {
        this.path = path;
        if (!fs.existsSync(path)) {
            this.config = {} as ConfigType;
            this.save();
        } else {
            this.config = JSON.parse(fs.readFileSync(path).toString("utf-8"));
        }
    }
    
    public save() {
        fs.writeFileSync(this.path, JSON.stringify(this.config, undefined, 2), {
            encoding: "utf-8",
            flag: "w+",
            mode: "0777"
        });
    }
}
