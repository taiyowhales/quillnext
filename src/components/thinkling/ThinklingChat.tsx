"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaperPlaneRight, Robot, User as UserIcon, Trash } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";

interface ThinklingChatProps {
    studentId: string;
    mode: string;
}

export function ThinklingChat({ studentId, mode }: ThinklingChatProps) {
    // Construct URL with query params to ensure context is passed even if body is ignored
    const apiUrl = `/api/chat?studentId=${studentId}&mode=${mode}`;

    const { messages, setMessages, sendMessage, status, stop } = useChat({
        // api: apiUrl, // Defaulting to /api/chat. 'api' property is invalid in this SDK version types.
        // body: { studentId, mode }, // Removed: passed manually in sendMessage
        // body: { studentId, mode }, // Removed: passed manually in sendMessage
        onError: (e) => console.error("ThinklingChat API Error:", e),
        onFinish: (event) => {
            console.log("ThinklingChat Finished Event:", event);

            // The onFinish callback provides an event object containing the message
            // We need to extract .message to get the actual UIMessage
            const { message } = event as any;
            console.log("ThinklingChat Finished Message Extracted:", message);

            // Fallback: If for some reason the stream didn't update the UI, append the final message manually
            // This handles cases where intermediate state updates might have been suppressed
            if (message) {
                setMessages(currentMessages => {
                    // Check if message already exists (by ID) to avoid dupe
                    if (currentMessages.some(m => m.id === message.id)) return currentMessages;
                    return [...currentMessages, message];
                });
            }
        }
    });

    const [input, setInput] = useState("");
    const isLoading = status === "streaming" || status === "submitted";

    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Clear chat when mode or student changes
    useEffect(() => {
        setMessages([]);
        setInput("");
    }, [mode, studentId, setMessages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput(""); // Clear input immediately

        // Correct usage for AI SDK: Use sendMessage (object)
        // @ts-ignore - sendMessage signature check
        await sendMessage({
            role: "user",
            content: userMessage
        } as any, {
            body: { studentId, mode }
        });
    };

    return (
        <Card className="h-[600px] flex flex-col border-qc-border-subtle shadow-lg">
            <CardHeader className="py-4 border-b bg-qc-parchment/50">
                <div className="flex justify-between items-center">
                    <div>

                        <CardDescription>
                            Current Mode: <span className="font-semibold text-qc-charcoal">{mode}</span>
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="Clear Chat">
                        <Trash />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-qc-text-muted opacity-70">
                        <Avatar className="h-20 w-20 mb-4 rounded-none border-0">
                            <AvatarImage src="/assets/branding/Inkling.png" alt="Thinkling" />
                            <AvatarFallback><Robot size={48} /></AvatarFallback>
                        </Avatar>
                        <p>How can I help you today?</p>
                    </div>
                )}

                {messages.map((m: any, index: number) => {
                    // DEBUG: Log assistant messages to see why they are blank
                    if (m.role !== 'user') console.log("Rendering Assistant Message:", m);

                    return (
                        <div key={`${m.id}-${index}`} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className={`w-8 h-8 mt-1 ${m.role !== 'user' ? 'rounded-none border-0' : 'border'}`}>
                                {m.role !== 'user' && <AvatarImage src="/assets/branding/Inkling.png" alt="Thinkling" />}
                                <AvatarFallback className={m.role === 'user' ? 'bg-qc-primary text-white' : 'bg-qc-accent text-white'}>
                                    {m.role === 'user' ? <UserIcon /> : <Robot />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-qc-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>
                                        {m.content
                                            ? m.content
                                            : (m.parts && Array.isArray(m.parts))
                                                ? m.parts.map((p: any) => p.text).join('')
                                                : ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex gap-3">
                        <Avatar className="w-8 h-8 mt-1 border-0 rounded-none">
                            <AvatarImage src="/assets/branding/Inkling.png" alt="Thinkling" />
                            <AvatarFallback className="bg-qc-accent text-white"><Robot /></AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500 animate-pulse">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <div className="p-4 border-t bg-white">
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <PaperPlaneRight weight="fill" />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
