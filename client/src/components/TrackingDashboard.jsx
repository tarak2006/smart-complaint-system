import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, TrendingUp, CalendarDays } from 'lucide-react';

const TrackingDashboard = ({ data, onBack }) => {
    const stages = [
        'Complaint Registered',
        'Technician Assigned',
        'Pickup Scheduled',
        'Appliance Picked Up',
        'Repair In Progress',
        'Quality Check',
        'Ready for Delivery',
        'Delivered / Issue Resolved'
    ];

    const currentStatus = data.status || 'Complaint Registered';
    const currentStep = stages.indexOf(currentStatus);
    const workCompleted = Math.round(((currentStep + 1) / stages.length) * 100);
    const daysRemaining = data.estimatedDays || 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: '30px', maxWidth: '600px', width: '100%' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{
                    display: 'inline-flex', padding: '8px 16px', borderRadius: '8px',
                    background: 'transparent', color: 'var(--text-main)',
                    fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--glass-border)', letterSpacing: '1px', textTransform: 'uppercase'
                }}>
                    {currentStatus}
                </div>
                <h2 style={{ marginTop: '15px', fontSize: '1.8rem', letterSpacing: '2px', color: 'white' }}>
                    {data.complaintId}
                </h2>
            </div>

            {/* Workflow Stepper */}
            <div style={{ marginBottom: '40px', padding: '0 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
                    <div style={{ position: 'absolute', top: '15px', left: 0, width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (stages.length - 1)) * 100}%` }}
                        style={{ position: 'absolute', top: '15px', left: 0, height: '2px', background: 'var(--accent)', zIndex: 1 }}
                    />
                    {stages.map((stage, index) => (
                        <div key={stage} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: index <= currentStep ? 'var(--accent)' : 'var(--bg-dark)',
                                border: '2px solid',
                                borderColor: index <= currentStep ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                                color: index <= currentStep ? 'var(--bg-dark)' : 'white',
                                transition: 'all 0.3s'
                            }}>
                                {index < currentStep ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {currentStatus}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '12px', textAlign: 'center' }}>
                    <Clock size={20} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Estimated Time</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{daysRemaining} Days</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '12px', textAlign: 'center' }}>
                    <TrendingUp size={20} color="var(--accent)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Overall Progress</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{workCompleted}%</div>
                </div>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '15px', padding: '20px',
                border: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Appliance Type</div>
                    <div style={{ fontWeight: 500 }}>{data.applianceType}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Brand</div>
                    <div style={{ fontWeight: 500 }}>{data.applianceBrand || 'Generic'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Preferred Pickup</div>
                    <div style={{ fontWeight: 500 }}>{data.pickupDate || 'Not specified'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
                    <div style={{ fontWeight: 500 }}>{data.customerName}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Service Address</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{data.address || 'No address provided'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>Issue Description</div>
                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>"{data.issueDescription}"</div>
                </div>
            </div>


            <button className="glow-button" style={{ width: '100%', marginTop: '25px' }} onClick={onBack}>
                Back to Portal
            </button>
        </motion.div>
    );
};

export default TrackingDashboard;
