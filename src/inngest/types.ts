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

type Events = {
    "resource/process.document": ProcessDocumentEvent;
    "chat/message.sent": ChatMessageSentEvent;
};

export const schema = new EventSchemas().fromRecord<Events>();
