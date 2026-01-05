import { EventSchemas } from "inngest";

type ProcessDocumentEvent = {
    data: {
        resourceId: string;
        fileUrl: string;
        fileType: string;
    };
};

type ChatMessageSentEvent = {
    data: {
        studentId: string;
        message: string;
    };
};

type CurriculumCompileEvent = {
    data: {
        specId: string;
        bundleId: string;
        organizationId: string;
        userId: string;
    };
};

type Events = {
    "resource/process.document": ProcessDocumentEvent;
    "chat/message.sent": ChatMessageSentEvent;
    "curriculum/compile": CurriculumCompileEvent;
};

export const schema = new EventSchemas().fromRecord<Events>();
