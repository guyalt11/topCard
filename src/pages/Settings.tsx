import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
    const { currentUser, updatePassword, deleteUser } = useAuth();
    const navigate = useNavigate();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.trim() === "") {
            toast({
                title: "Password cannot be empty",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                variant: "destructive",
            });
            return;
        }

        setIsUpdating(true);
        const success = await updatePassword(newPassword);

        if (success) {
            setNewPassword("");
            setConfirmPassword("");
            setIsPasswordDialogOpen(false);
            toast({
                title: "Password updated",
                description: "Your password has been successfully updated.",
            });
        } else {
            toast({
                title: "Password update failed",
                description: "An error occurred while updating your password.",
                variant: "destructive",
            });
        }
        setIsUpdating(false);
    };

    const handleDeleteAccount = async () => {
        if (!currentUser || isDeleting) return;

        setIsDeleting(true);

        try {
            const success = await deleteUser();

            if (success) {
                toast({
                    title: "Account deleted",
                    description: "Your account has been permanently deleted.",
                });

                // Navigate to home page after a short delay
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                setIsDeleting(false);
                toast({
                    title: "Deletion failed",
                    description: "Unable to delete your account. Please try again or contact support.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Account deletion error:', error);
            setIsDeleting(false);
            toast({
                title: "Deletion error",
                description: "An error occurred while deleting your account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

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
                                    className="bg-dark mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="user-id">User ID</Label>
                                <Input
                                    id="user-id"
                                    value={currentUser?.id || ''}
                                    disabled
                                    className="bg-dark mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* Security Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Security</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Change Password</Label>
                                    <p className="text-sm text-light-foreground">Update your account password</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPasswordDialogOpen(true)}
                                >
                                    Change Password
                                </Button>
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
                                    <p className="text-sm text-light-foreground">Get reminded when words are due for review</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Daily Goal</Label>
                                    <p className="text-sm text-light-foreground">Set a daily practice target</p>
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
                                    <p className="text-sm text-light-foreground">Download all your vocabulary lists</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* Danger Zone Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                        </div>
                        <div className="space-y-4 border border-danger/50 rounded-lg p-4 bg-danger/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-destructive">Delete Account</Label>
                                    <p className="text-sm text-light-foreground">Permanently delete your account and all data</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40" />

                    {/* About Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">About</h2>
                        <div className="space-y-2 text-sm text-light-foreground">
                            <p>Wörtli - Vocabulary Learning App</p>
                            <p>Version 1.0.0</p>
                            <p>© 2025 Wörtli. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your new password below. Make sure it's at least 6 characters long.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsPasswordDialogOpen(false);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers, including all your vocabulary lists
                            and practice progress.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-danger text-danger-foreground hover:bg-danger/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Settings;
