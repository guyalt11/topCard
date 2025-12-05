import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    message?: string;
}

const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gradient-dark rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
                <Loader2 className="h-12 w-12 animate-spin text-light" />
                <p className="text-lg font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
