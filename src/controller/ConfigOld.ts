import * as fs from "fs";

export interface ConfigDef {

}

export class Config<ConfigType = ConfigDef> {
    private readonly config: ConfigType;
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
    
    set<P extends keyof ConfigPaths<ConfigType>>(key: P, value: ConfigPaths<ConfigType>[P]) {
        const keys = (key as string).split(".");
        
        let cur: any = this.config;
        while (keys.length > 1) {
            if (!cur[keys[0]])
                cur[keys[0]] = {};
            cur = cur[keys.shift()];
        }
        
        cur[keys[0]] = value;
        this.save();
    }
    
    get<P extends keyof ConfigPaths<ConfigType>>(key: P, def: ConfigPaths<ConfigType>[P] | undefined): ConfigPaths<ConfigType>[P] | undefined {
        const keys = (key as string).split(".");
        
        let cur: any = this.config;
        while (keys.length > 1) {
            cur = cur[keys.shift()];
            if (!cur) {
                if (def !== undefined)
                    this.set(key, def);
                return def;
            }
        }
        
        return cur[keys[0]];
    }
    
    raw():ConfigType {
        return JSON.parse(JSON.stringify(this.config));
    }
    
    private save() {
        fs.writeFileSync(this.path, JSON.stringify(this.config, undefined, 2), {
            encoding: "utf-8",
            flag: "w+",
            mode: "0777"
        });
    }
}

type ConfigPaths<T> = {
    [path in Leaves<T>]: NestedValueOf<T, path>
}

type Join<K, P> = K extends string | number ?
    P extends string | number ?
        `${K}${"" extends P ? "" : "."}${P}`
        : never : never;

type Leaves<T, D extends number = 3> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T] : "";

type Prev = [never, 0, 1, 2, 3, 4, ...0[]]

type NestedValueOf<Obj, Key extends string> =
    Obj extends object ?
        Key extends `${infer Parent}.${infer Leaf}` ?
            Parent extends keyof Obj ?
                NestedValueOf<Obj[Parent], Leaf>
                : never
            : Key extends keyof Obj ? Obj[Key] : never
        : never
