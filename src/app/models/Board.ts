import IShot from "./Shot";
import ISubmarine from "./Submarine";

export default interface Board {
    submarines: ISubmarine[],
    shots: IShot[] // ej: {coord:"A5", hit:true, .....}
}