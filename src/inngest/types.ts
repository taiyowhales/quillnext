import { EventSchemas } from "inngest";

type ProcessDocumentEvent = {
    data: {
        resourceId: string;
        fileUrl: string;
        fileType: string;
    };
};

type Events = {
    "resource/process.document": ProcessDocumentEvent;
};

export const schema = new EventSchemas().fromRecord<Events>();
