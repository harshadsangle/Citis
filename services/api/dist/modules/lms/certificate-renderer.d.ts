type CertificateRenderInput = {
    learnerName: string;
    courseTitle: string;
    courseCode: string;
    institutionName: string;
    certificateNumber: string;
    issueDate: string;
    verificationId: string;
};
export declare function renderCertificateSvg(input: CertificateRenderInput): string;
export {};
