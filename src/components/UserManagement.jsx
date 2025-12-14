import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function UserManagement() {
  const { tenant } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/api/users/list/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, [tenant]);

  const filtered = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    (user.first_name + ' ' + user.last_name).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`https://${tenant}.agrigrid.net/api/users/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setUsers(users.filter(u => u.id !== id));
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Link to={`/dashboard/${tenant}/users/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add User
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border rounded-lg mb-6"
        />

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spray Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 text-sm">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'power' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'general' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.is_spray_operator ? '✅' : '❌'}
                </td>
                <td className="px-6 py-4 text-sm space-x-4">
                  <Link to={`/dashboard/${tenant}/users/edit/${user.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}