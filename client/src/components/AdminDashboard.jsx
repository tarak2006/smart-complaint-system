import { API_BASE } from '../config';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/complaints`);
                // Ensure response.data is an array. If it's a single object or something else, wrap it.
                setComplaints(Array.isArray(response.data) ? response.data : [response.data]);
            } catch (err) {
                console.error('Failed to fetch complaints:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${API_BASE}/api/complaints/${id}`, { status: newStatus });
            setComplaints(prev => prev.map(c => c.complaintId === id ? { ...c, status: newStatus } : c));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-dashboard-container"
            style={{ width: '100%', padding: '0 20px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Admin Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Management overview for all active service requests.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="glass-card" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input type="text" placeholder="Search ID..." style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
                    </div>
                    <button className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appliance</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((c) => (
                            <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }} className="table-row-hover">
                                <td style={{ padding: '15px 20px', fontWeight: 600 }}>{c.complaintId || 'N/A'}</td>
                                <td style={{ padding: '15px 20px' }}>{c.customerName}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{c.applianceType}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.applianceBrand || 'Generic'}</div>
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{
                                        padding: '5px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
                                        background: 'transparent',
                                        color: c.status?.includes('Delivered') ? 'var(--success)' : 'var(--primary)',
                                        border: '1px solid currentColor'
                                    }}>
                                        {c.status || 'Pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => updateStatus(c.complaintId, 'Technician Assigned')}
                                            title="Assign Technician"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        >
                                            <Users size={16} />
                                        </button>
                                        <button
                                            onClick={() => updateStatus(c.complaintId, 'Ready for Delivery')}
                                            title="Mark Ready"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Clock className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
                        <p>Loading complaints...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
