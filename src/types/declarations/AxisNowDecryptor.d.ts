declare module "AxisNowDecryptor" {
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

  declare const defaultExport: false | typeof Decryptor;

  export default defaultExport;
}
