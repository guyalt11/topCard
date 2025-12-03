import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { sendChatMessage, ChatMessage } from '@/services/chatService';
import { toast } from '@/components/ui/use-toast';
import { useVocab } from '@/context/VocabContext';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '@/components/LoadingOverlay';

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChatDialog = ({ open, onOpenChange }: ChatDialogProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingList, setIsSavingList] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { importList } = useVocab();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Helper function to detect and extract JSON from response
    const extractJSON = (text: string): any | null => {
        try {
            // Try to find JSON in code blocks first
            const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                return JSON.parse(codeBlockMatch[1]);
            }

            // Try to find JSON object directly
            const jsonMatch = text.match(/\{[\s\S]*"name"[\s\S]*"language"[\s\S]*"words"[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    // Helper function to validate vocabulary list JSON
    const isValidVocabList = (obj: any): boolean => {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.name === 'string' &&
            typeof obj.language === 'string' &&
            Array.isArray(obj.words) &&
            obj.words.every((word: any) =>
                typeof word.origin === 'string' &&
                typeof word.transl === 'string'
            )
        );
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(userMessage.content, messages);

            // Check if response contains a valid vocabulary list JSON
            const jsonData = extractJSON(response);

            if (jsonData && isValidVocabList(jsonData)) {
                // JSON detected - import it and show a friendly message instead
                console.log('[ChatDialog] Valid vocabulary list detected, importing...');

                // Show a friendly message to the user instead of the JSON
                const friendlyMessage: ChatMessage = {
                    role: 'assistant',
                    content: `Great! I've created a vocabulary list called "${jsonData.name}" with ${jsonData.words.length} words. Importing it now...`,
                };
                setMessages((prev) => [...prev, friendlyMessage]);

                // Show loading overlay while importing
                setIsSavingList(true);

                // Create a File object from the JSON data
                const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
                const jsonFile = new File([jsonBlob], `${jsonData.name}.json`, { type: 'application/json' });

                // Import the list
                const importedList = await importList(jsonFile, jsonData.name);

                if (importedList) {
                    toast({
                        title: 'List Created!',
                        description: `"${jsonData.name}" has been added to your vocabulary lists.`,
                    });

                    // Close the chat dialog and navigate to the new list
                    onOpenChange(false);

                    // Small delay to ensure the dialog closes before navigation
                    setTimeout(() => {
                        navigate(`/list/${importedList.id}`);
                    }, 100);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to import the vocabulary list.',
                        variant: 'destructive',
                    });
                }
            } else {
                // No JSON or invalid JSON - show the normal response
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error: any) {
            console.error('Chat error:', error);

            // Extract error message from the API response
            let errorMessage = 'Failed to get response from AI. Please try again.';

            if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setIsSavingList(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {isSavingList && <LoadingOverlay message="Saving vocabulary list..." />}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-full md:max-w-3xl h-[100dvh] flex flex-col p-0 gap-0 border-0 sm:border animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 sm:rounded-lg rounded-none">
                    <DialogHeader className="px-6 pt-5 pb-5 border-b-0 sm:border-b border-white/20 bg-card-gradient">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <MessageCircle className="h-6 w-6 text-primary" />
                            Vocabulary Assistant
                        </DialogTitle>
                    </DialogHeader>

                    {/* Messages Container */}
                    <div className="flex-1 flex flex-col overflow-y-auto px-6 py-3 space-y-3 bg-dark-transparent">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                    <MessageCircle className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold">Start a conversation</p>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        I'm here to help you generate vocabulary lists!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-lg transition-all hover:shadow-xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`} style={message.role === 'assistant' ? { background: 'linear-gradient(135deg, rgba(21, 76, 82, 1) 0%, rgba(8, 35, 38, 1) 100%)' } : {}}>
                                        <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                                <div className="rounded-2xl px-5 py-3 shadow-lg bg-card-gradient">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    {/* Input Container */}
                    <div className="border-t-0 sm:border-t border-white/20 px-6 py-4 bg-card-gradient">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 text-sm md:text-base border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all bg-dark-solid"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="h-12 w-12 rounded-xl transition-all hover:scale-105 active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChatDialog;
