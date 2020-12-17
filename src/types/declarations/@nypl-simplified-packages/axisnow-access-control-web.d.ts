declare module "@nypl-simplified-packages/axisnow-access-control-web" {
  import IDecryptor from "library-simplified-webpub-viewer/dist/Decryptor";

  class Decryptor implements IDecryptor {
    readonly keyPair: CryptoKeyPair;
    readonly contentKey: CryptoKey;
    readonly containerUrl: string;
    static createDecryptor(params: any): Promise<Decryptor>;
    private constructor();
    getEntryUrl(): string;
    private decrypt;
    decryptUrl(resourceUrl: string): Promise<Uint8Array>;
  }

  declare const defaultExport: typeof Decryptor | undefined;

  export default defaultExport;

  declare type ErrorInfo = {
    title: string;
    detail: string;
    status?: number;
    url?: string;
  };
  declare class AxisNowDecryptionError extends Error {
    info: ErrorInfo;
    baseError?: Error;
    constructor(info: Partial<ErrorInfo>, baseError?: Error);
  }

  export const AxisNowDecryptionError:
    | undefined
    | typeof AxisNowDecryptionError;
}
