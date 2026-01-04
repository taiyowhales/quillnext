"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "@/components/ui/button";
import { Book, Video, PresentationChart } from "@phosphor-icons/react";
import { getLibraryResources } from "@/app/actions/resource-library-actions";
import { Book as BookType, VideoResource as VideoType, Article as ArticleType, DocumentResource as DocumentType } from "@/generated/client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, File } from "@phosphor-icons/react";

interface ResourcePickerProps {
    organizationId: string;
    trigger?: React.ReactNode;
    onSelectBook?: (book: BookType) => void;
    onSelectVideo?: (video: VideoType) => void;
    onSelectArticle: (article: ArticleType) => void;
    onSelectDocument: (doc: DocumentType) => void;
    onSelectResource: (resource: { id: string; title: string; resourceKind: { label: string } }) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ResourcePicker({
    organizationId,
    trigger,
    onSelectBook,
    onSelectVideo,
    onSelectArticle,
    onSelectDocument,
    onSelectResource, // Added missing destructuring
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: ResourcePickerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen || setInternalOpen;

    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState<BookType[]>([]);
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [articles, setArticles] = useState<ArticleType[]>([]);
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [resources, setResources] = useState<{ id: string; title: string; resourceKind: { label: string } }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLibrary() {
            try {
                const res = await getLibraryResources(organizationId);
                if (res.success) {
                    setBooks(res.books || []);
                    setVideos(res.videos || []);
                    setArticles(res.articles || []);
                    setDocuments(res.documents || []);
                    setResources(res.resources || []);
                }
            } catch (error) {
                console.error("Failed to fetch library resources", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (open) {
            fetchLibrary();
        }
    }, [open, organizationId]);

    const handleSelectBook = (book: BookType) => {
        onSelectBook?.(book);
        setOpen(false);
    };

    const handleSelectVideo = (video: VideoType) => {
        onSelectVideo?.(video);
        setOpen(false);
    };

    const handleSelectArticle = (article: ArticleType) => {
        onSelectArticle?.(article);
        setOpen(false);
    };

    const handleSelectDocument = (doc: DocumentType) => {
        onSelectDocument(doc);
        setOpen(false);
    };

    const handleSelectResource = (resource: { id: string; title: string; resourceKind: { label: string } }) => {
        onSelectResource(resource);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Resource</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="books" className="flex-1 flex flex-col min-h-0">
                    <TabsList>
                        <TabsTrigger value="books" className="gap-2"><Book /> Books</TabsTrigger>
                        <TabsTrigger value="videos" className="gap-2"><Video /> Videos</TabsTrigger>
                        <TabsTrigger value="articles" className="gap-2"><FileText /> Articles</TabsTrigger>
                        <TabsTrigger value="documents" className="gap-2"><File /> Documents</TabsTrigger>
                        <TabsTrigger value="resources" className="gap-2"><PresentationChart /> Resources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="books" className="flex-1 overflow-y-auto min-h-0 py-4">
                        {loading ? <p>Loading books...</p> : (
                            <div className="grid grid-cols-2 gap-4">
                                {books.map(book => (
                                    <Card
                                        key={book.id}
                                        className="p-3 cursor-pointer hover:border-qc-primary flex flex-col gap-2 transition-all"
                                        onClick={() => handleSelectBook(book)}
                                    >
                                        <div className="flex items-center justify-center bg-gray-100 rounded h-32">
                                            {book.coverUrl ? (
                                                <img src={book.coverUrl} alt={book.title} className="h-full object-contain" />
                                            ) : (
                                                <Book size={32} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{book.title}</h4>
                                            <p className="text-xs text-muted-foreground">{Array.isArray(book.authors) ? (book.authors as string[]).join(", ") : "Unknown Author"}</p>
                                        </div>
                                    </Card>
                                ))}
                                {books.length === 0 && <p className="col-span-full text-center text-muted-foreground">No books found.</p>}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="videos" className="flex-1 overflow-y-auto min-h-0 py-4">
                        {loading ? <p>Loading videos...</p> : (
                            <div className="grid grid-cols-2 gap-4">
                                {videos.map(video => (
                                    <Card
                                        key={video.id}
                                        className="p-3 cursor-pointer hover:border-qc-primary flex flex-col gap-2 transition-all"
                                        onClick={() => handleSelectVideo(video)}
                                    >
                                        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                            {video.thumbnailUrl ? (
                                                <img src={video.thumbnailUrl} alt={video.title || "Video"} className="w-full h-full object-cover" />
                                            ) : (
                                                <Video size={32} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{video.title || "Untitled Video"}</h4>
                                            <p className="text-xs text-muted-foreground">{video.channelName}</p>
                                        </div>
                                    </Card>
                                ))}
                                {videos.length === 0 && <p className="col-span-full text-center text-muted-foreground">No videos found.</p>}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="articles" className="flex-1 overflow-y-auto min-h-0 py-4">
                        {loading ? <p>Loading articles...</p> : (
                            <div className="grid grid-cols-2 gap-4">
                                {articles.map(article => (
                                    <Card
                                        key={article.id}
                                        className="p-3 cursor-pointer hover:border-qc-primary flex flex-col gap-2 transition-all"
                                        onClick={() => handleSelectArticle(article)}
                                    >
                                        <div className="flex items-center justify-center bg-gray-100 rounded h-24">
                                            <FileText size={32} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{article.title}</h4>
                                            {/* Article schema might not have author field, hiding for now */}
                                            {/* <p className="text-xs text-muted-foreground">{article.author || "Unknown Author"}</p> */}
                                        </div>
                                    </Card>
                                ))}
                                {articles.length === 0 && <p className="col-span-full text-center text-muted-foreground">No articles found.</p>}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="documents" className="flex-1 overflow-y-auto min-h-0 py-4">
                        {loading ? <p>Loading documents...</p> : (
                            <div className="grid grid-cols-2 gap-4">
                                {documents.map(doc => (
                                    <Card
                                        key={doc.id}
                                        className="p-3 cursor-pointer hover:border-qc-primary flex flex-col gap-2 transition-all"
                                        onClick={() => handleSelectDocument(doc)}
                                    >
                                        <div className="flex items-center justify-center bg-gray-100 rounded h-24">
                                            <File size={32} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{doc.fileName}</h4>
                                            <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </Card>
                                ))}
                                {documents.length === 0 && <p className="col-span-full text-center text-muted-foreground">No documents found.</p>}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="resources" className="flex-1 overflow-y-auto min-h-0 py-4">
                        {loading ? <p>Loading resources...</p> : (
                            <div className="grid grid-cols-2 gap-4">
                                {resources.map(res => (
                                    <Card
                                        key={res.id}
                                        className="p-3 cursor-pointer hover:border-qc-primary flex flex-col gap-2 transition-all"
                                        onClick={() => handleSelectResource(res)}
                                    >
                                        <div className="flex items-center justify-center bg-gray-100 rounded h-24">
                                            <PresentationChart size={32} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2">{res.title}</h4>
                                            <p className="text-xs text-muted-foreground text-qc-primary">{res.resourceKind.label}</p>
                                        </div>
                                    </Card>
                                ))}
                                {resources.length === 0 && <p className="col-span-full text-center text-muted-foreground">No resources found.</p>}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent >
        </Dialog >
    );
}
