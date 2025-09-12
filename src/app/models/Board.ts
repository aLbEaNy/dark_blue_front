import Shot from "./Shot";
import ISubmarine from "./Submarine";

export default interface Board {
    submarines: ISubmarine[],
    shots: Shot[] // ej: {coord:"A5", hit:true, .....}
}