import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { CertificateService } from "./certificate.service";
import { CertificateListQueryDto } from "./lms.dto";
export declare class PublicCertificateController {
    private readonly certificates;
    constructor(certificates: CertificateService);
    verify(identifier: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        valid: boolean;
        certificate_number?: undefined;
        verification_id?: undefined;
        learner_name?: undefined;
        course_title?: undefined;
        course_code?: undefined;
        institution_name?: undefined;
        issue_date?: undefined;
    } | {
        valid: boolean;
        certificate_number: unknown;
        verification_id: unknown;
        learner_name: string;
        course_title: unknown;
        course_code: unknown;
        institution_name: unknown;
        issue_date: unknown;
    }>>;
}
export declare class CertificateController {
    private readonly certificates;
    constructor(certificates: CertificateService);
    list(request: ContextRequest, query: CertificateListQueryDto): Promise<import("../../common/response").ApiSuccess<{
        id: unknown;
        certificate_number: unknown;
        verification_id: unknown;
        learner_name: string;
        course_title: unknown;
        course_code: unknown;
        institution_name: unknown;
        issue_date: unknown;
        status: unknown;
        document_format: unknown;
    }[]>>;
    get(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        id: unknown;
        certificate_number: unknown;
        verification_id: unknown;
        learner_name: string;
        course_title: unknown;
        course_code: unknown;
        institution_name: unknown;
        issue_date: unknown;
        status: unknown;
        document_format: unknown;
    }>>;
    download(id: string, request: ContextRequest, response: Response): Promise<Response<any, Record<string, any>>>;
}
