import { IDL } from '../amm/idl';
import { AnchorError } from '@coral-xyz/anchor';
import { PROGRAM_ID } from './constants';
class DynamicAmmError extends Error {
    constructor(error) {
        let _errorCode = 0;
        let _errorName = 'Something went wrong';
        let _errorMessage = 'Something went wrong';
        if (error instanceof Error) {
            const anchorError = AnchorError.parse(JSON.parse(JSON.stringify(error)).transactionLogs);
            if ((anchorError === null || anchorError === void 0 ? void 0 : anchorError.program.toBase58()) === PROGRAM_ID) {
                _errorCode = anchorError.error.errorCode.number;
                _errorName = anchorError.error.errorCode.code;
                _errorMessage = anchorError.error.errorMessage;
            }
        }
        else {
            const idlError = IDL.errors.find((err) => err.code === error);
            if (idlError) {
                _errorCode = idlError.code;
                _errorName = idlError.name;
                _errorMessage = idlError.msg;
            }
        }
        super(_errorMessage);
        this.errorCode = _errorCode;
        this.errorName = _errorName;
        this.errorMessage = _errorMessage;
    }
}
export default DynamicAmmError;
//# sourceMappingURL=error.js.map