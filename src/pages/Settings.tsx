import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Settings = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                {/* Account Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Account</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={currentUser?.email || ''}
                                    disabled
                                    className="bg-dark-solid mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="user-id">User ID</Label>
                                <Input
                                    id="user-id"
                                    value={currentUser?.id || ''}
                                    disabled
                                    className="bg-dark-solid mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* Preferences Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Practice Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Get reminded when words are due for review</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Daily Goal</Label>
                                    <p className="text-sm text-muted-foreground">Set a daily practice target</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* Data & Privacy Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Export Data</Label>
                                    <p className="text-sm text-muted-foreground">Download all your vocabulary lists</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Delete Account</Label>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                                </div>
                                <Button variant="destructive" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* About Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">About</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Wörtli - Vocabulary Learning App</p>
                            <p>Version 1.0.0</p>
                            <p>© 2025 Wörtli. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
