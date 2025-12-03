
import { Settings, LogOut, User, KeyRound, Trash2, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

const SettingsMenu = () => {
  const { currentUser, logout, updatePassword, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (newPassword.trim() === '') {
      toast({
        title: "Password cannot be empty",
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

    const success = await updatePassword(newPassword);

    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      setIsResetPasswordOpen(false);

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

        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login');
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
      setIsDeleteAccountOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Top Card - Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Top Card - Settings</DropdownMenuLabel>
          {currentUser && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{currentUser.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          {currentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="flex items-center gap-2">
                <Cog className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)} className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>Reset Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteAccountOpen(true)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsMenu;
