import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function UserList() {
  const { tenant } = useParams();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/api/users/list/`, {
      credentials: 'include',
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      })
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [tenant]);

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      power: 'bg-blue-100 text-blue-800',
      general: 'bg-green-100 text-green-800',
      view: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role] || styles.view}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>;
  };

  if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading users...</div>;
  if (error) return <div className="text-center py-20 text-xl text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
            />
            <Link
              to={`/dashboard/${tenant}/users/add`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg text-center transition whitespace-nowrap"
            >
              + Add User
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spray Operator</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-lg">
                    {search ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.email || '-'}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-center text-2xl">
                      {user.is_spray_operator ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-4">
                      <Link to={`/dashboard/${tenant}/users/edit/${user.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}