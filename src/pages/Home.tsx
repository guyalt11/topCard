import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, Zap, Target } from "lucide-react";

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Brain className="h-12 w-12 text-primary" />,
            title: "AI-Powered Learning",
            description: "Generate vocabulary lists instantly with our AI assistant tailored to your learning goals"
        },
        {
            icon: <Target className="h-12 w-12 text-primary" />,
            title: "Smart Practice System",
            description: "Adaptive spaced repetition ensures you review words at the perfect time for maximum retention"
        },
        {
            icon: <Zap className="h-12 w-12 text-primary" />,
            title: "Track Your Progress",
            description: "Monitor your learning journey with detailed statistics and achievement tracking"
        },
        {
            icon: <BookOpen className="h-12 w-12 text-primary" />,
            title: "Shared Library",
            description: "Access thousands of community-created vocabulary lists or share your own"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Master Any Language
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                    Like a personal coach who truly understands you.
                </p>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Wörtli uses AI and spaced repetition to help you build vocabulary faster and remember it longer.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                    <Button
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
                    >
                        Get Started Free
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="px-8 py-6 text-lg"
                    >
                        Log In
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    or try it in your browser
                </p>
            </div>

            {/* How It Works Section */}
            <div className="container mx-auto px-4 py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                    How it works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-6 rounded-lg bg-card-gradient hover:scale-105 transition-transform duration-300"
                        >
                            <div className="mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-card-gradient rounded-2xl p-12 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to start learning?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of language learners who are already mastering vocabulary with Wörtli.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
                    >
                        Start Learning Now
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t">
                <p>© 2025 Wörtli. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
