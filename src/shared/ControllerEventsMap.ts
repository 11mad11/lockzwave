import {HealNodeStatus, InclusionStrategy, InclusionResult, ControllerStatistics} from "zwave-js";

export interface ControllerListenEvents extends Record<string, (...args: any[]) => void> {


}

export interface ControllerEmitEvents extends Record<string, (...args: any[]) => void> {
    "all nodes ready"(): void
    
    "error"(msg: string): void
    
    
    "exclusion started"(): void
    
    "exclusion stopped"(): void
    
    "exclusion failed"(): void
    
    
    "inclusion started"(secure: boolean, strategy: InclusionStrategy): void
    
    "inclusion stopped"(): void
    
    "inclusion failed"(): void
    
    
    "node added"(nodeID: number, result: InclusionResult): void
    
    "node removed"(nodeID: number, replaced: boolean): void
    
    
    "heal network progress"(progress: Record<string, HealNodeStatus>): void
    
    "heal network done"(result: Record<string, HealNodeStatus>): void
    
    
    "statistics updated"(statistics: ControllerStatistics): void
}
