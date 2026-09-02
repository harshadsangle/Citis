import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { CertificateListQueryDto } from "./lms.dto";
export declare class CertificateService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private certificateNumber;
    private verificationId;
    private certificateRow;
    private assertCertificateAccess;
    private safeDetails;
    list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query?: CertificateListQueryDto): Promise<{
        data: {
            id: unknown;
            course_id: unknown;
            certificate_number: unknown;
            verification_id: unknown;
            learner_name: string;
            course_title: unknown;
            course_code: unknown;
            institution_name: unknown;
            issue_date: unknown;
            status: unknown;
            document_format: unknown;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(id: string, user: AuthenticatedUser): Promise<{
        id: unknown;
        course_id: unknown;
        certificate_number: unknown;
        verification_id: unknown;
        learner_name: string;
        course_title: unknown;
        course_code: unknown;
        institution_name: unknown;
        issue_date: unknown;
        status: unknown;
        document_format: unknown;
    }>;
    download(id: string, request: ContextRequest): Promise<{
        content: Buffer<ArrayBuffer>;
        filename: string;
    }>;
    verify(identifier: string, requestId?: string): Promise<{
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
    }>;
    issueIfEligible(tenantId: string, courseId: string, learnerId: string, request?: ContextRequest): Promise<{
        id: unknown;
        course_id: unknown;
        certificate_number: unknown;
        verification_id: unknown;
        learner_name: string;
        course_title: unknown;
        course_code: unknown;
        institution_name: unknown;
        issue_date: unknown;
        status: unknown;
        document_format: unknown;
    } | null>;
}
