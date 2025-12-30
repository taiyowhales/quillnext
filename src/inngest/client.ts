import { Inngest } from "inngest";
import { schema } from "@/inngest/types";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quillnext", schemas: schema });
