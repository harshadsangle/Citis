export interface LmsUpload {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export interface StoredFile {
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    byteSize: number;
    sha256: string;
    entrypoint?: string;
}
export declare function mimeTypeForFilename(filename: string): "text/html" | "text/css" | "text/javascript" | "application/json" | "application/xml" | "image/svg+xml" | "image/png" | "image/jpeg" | "image/gif" | "font/woff" | "font/woff2" | "application/octet-stream";
export declare class ResourceStorageService {
    storeDocument(tenantId: string, resourceId: string, file: LmsUpload): Promise<StoredFile>;
    storeScormPackage(tenantId: string, resourceId: string, file: LmsUpload): Promise<StoredFile>;
    read(storageKey: string): Promise<NonSharedBuffer>;
    readScormAsset(storageKey: string, assetPath: string): Promise<NonSharedBuffer>;
    remove(storageKey: string): Promise<void>;
    private findEntrypoint;
}
