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

  declare const defaultExport: typeof Decryptor;

  export default defaultExport;
}
