import IShot from "./IShot";
import ISubmarine from "./ISubmarine";

export default interface IBoaard {
    submarines: ISubmarine[],
    shots: IShot[] // ej: {coord:"A5", hit:true, .....}
}