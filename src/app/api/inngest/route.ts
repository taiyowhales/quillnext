import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processDocument } from "@/inngest/functions/process-document";
import { scanMessage } from "@/inngest/functions/safety-scan";
import { compileCurriculum } from "@/inngest/functions/compile-curriculum";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processDocument,
        scanMessage,
        compileCurriculum,
    ],
});
