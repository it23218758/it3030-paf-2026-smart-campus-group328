import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { ShieldCheck, UserCircle, Wrench, Search, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users. Ensure you have admin privileges.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        setError('');
        setSuccessMessage('');
        
        try {
            await axios.patch(`/api/users/${userId}/role`, { role: newRole });
            
            // Update local state to reflect change
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );
            
            setSuccessMessage("User role updated successfully");
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (err) {
            setError(err.response?.data || 'Failed to update user role');
            console.error(err);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(usr => 
        (usr.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (usr.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <ShieldCheck className="w-5 h-5 text-purple-600" />;
            case 'TECHNICIAN': return <Wrench className="w-5 h-5 text-orange-600" />;
            default: return <UserCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'TECHNICIAN': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-2 text-gray-600">Manage user roles and permissions across the SmartCampus system.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                    <p className="text-green-700">{successMessage}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    <div className="text-sm text-gray-500 ml-4 font-medium">
                        Total Users: {filteredUsers.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((usr) => (
                                    <tr key={usr.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                                    {usr.avatarUrl ? (
                                                        <img src={usr.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
                                                    ) : (
                                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{usr.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {usr.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{usr.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(usr.role)}`}>
                                                <span className="mr-1">{getRoleIcon(usr.role)}</span>
                                                {usr.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                disabled={updatingUserId === usr.id}
                                                value={usr.role}
                                                onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                                                    updatingUserId === usr.id ? 'opacity-50 cursor-not-allowed' : ''
                                                } ${currentUser && currentUser.id === usr.id ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="TECHNICIAN">TECHNICIAN</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                            {currentUser && currentUser.email === usr.email && (
                                                <span className="text-xs text-gray-400 italic">Self (Cannot demote via UI)</span>
                                            )}
                                            {updatingUserId === usr.id && (
                                                <span className="ml-2 text-xs text-primary-600">Updating...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
