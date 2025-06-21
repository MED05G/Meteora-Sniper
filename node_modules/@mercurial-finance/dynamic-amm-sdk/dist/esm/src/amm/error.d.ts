import { IDL } from '../amm/idl';
type Codes = (typeof IDL.errors)[number]['code'];
declare class DynamicAmmError extends Error {
    errorCode: number;
    errorName: string;
    errorMessage: string;
    constructor(error: object | Codes);
}
export default DynamicAmmError;
//# sourceMappingURL=error.d.ts.map