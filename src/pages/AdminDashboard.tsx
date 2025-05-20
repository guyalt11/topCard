
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { Home, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { users, createUser, updateUser, deleteUser, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for new user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State for delete dialog
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for edit dialog
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUsername.trim() === '' || newPassword.trim() === '') {
      toast({
        title: "Invalid input",
        description: "Username and password are required.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if username already exists
    if (users.some(user => user.username === newUsername)) {
      toast({
        title: "Username exists",
        description: "This username is already taken.",
        variant: "destructive",
      });
      return;
    }
    
    createUser({
      username: newUsername,
      password: newPassword,
      isAdmin
    });
    
    toast({
      title: "User created",
      description: `User ${newUsername} has been created.`
    });
    
    // Reset form
    setNewUsername('');
    setNewPassword('');
    setIsAdmin(false);
  };
  
  const toggleUserAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    // Prevent removing admin status from self
    if (currentUser?.id === userId && isCurrentlyAdmin) {
      toast({
        title: "Action denied",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive",
      });
      return;
    }
    
    updateUser(userId, { isAdmin: !isCurrentlyAdmin });
    toast({
      title: "User updated",
      description: `Admin status ${!isCurrentlyAdmin ? 'granted' : 'revoked'}.`
    });
  };
  
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    
    // Prevent deleting self
    if (currentUser?.id === userToDelete) {
      toast({
        title: "Action denied",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }
    
    deleteUser(userToDelete);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    
    toast({
      title: "User deleted",
      description: "The user has been deleted."
    });
  };
  
  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };
  
  const openEditDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToEdit(userId);
      setEditUsername(user.username);
      setEditPassword(''); // Don't prefill password for security
      setEditIsAdmin(user.isAdmin);
      setEditDialogOpen(true);
    }
  };
  
  const handleEditUser = () => {
    if (!userToEdit) return;
    
    const updates: {username?: string; password?: string; isAdmin?: boolean} = {};
    
    if (editUsername.trim() !== '') {
      // Check if new username is already taken by another user
      const existingUser = users.find(u => u.username === editUsername && u.id !== userToEdit);
      if (existingUser) {
        toast({
          title: "Username exists",
          description: "This username is already taken.",
          variant: "destructive",
        });
        return;
      }
      updates.username = editUsername;
    }
    
    if (editPassword.trim() !== '') {
      updates.password = editPassword;
    }
    
    updates.isAdmin = editIsAdmin;
    
    updateUser(userToEdit, updates);
    setEditDialogOpen(false);
    
    toast({
      title: "User updated",
      description: "User details have been updated."
    });
  };
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/')}>
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAdmin"
                  checked={isAdmin}
                  onCheckedChange={setIsAdmin}
                />
                <Label htmlFor="isAdmin">Admin privileges</Label>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateUser} className="w-full">Create User</Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isAdmin}
                        onCheckedChange={() => toggleUserAdmin(user.id, user.isAdmin)}
                        disabled={currentUser?.id === user.id && user.isAdmin}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteDialog(user.id)}
                          disabled={currentUser?.id === user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isAdmin"
                checked={editIsAdmin}
                onCheckedChange={setEditIsAdmin}
                disabled={currentUser?.id === userToEdit && editIsAdmin}
              />
              <Label htmlFor="edit-isAdmin">
                Admin privileges
                {currentUser?.id === userToEdit && editIsAdmin && (
                  <span className="text-xs text-muted-foreground ml-2">(Cannot remove own admin rights)</span>
                )}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
