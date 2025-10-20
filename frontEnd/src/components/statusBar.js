import React from 'react';
import { useUser } from './ContextUser';

function StatusBar() {
  const { user } = useUser();
const { money, level, name } = user;

return (
    <div
    style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        borderRadius: '12px',
        width: '95%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, sans-serif',
        padding: '2% 2%',
    }}
    >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: '600', fontSize: '16px', color: '#111' }}>
            ${money.toLocaleString()}
        </span>
    </div>

    <div style={{ textAlign: 'center', paddingLeft: '5%' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>Level</span>
        <div
        style={{
            fontWeight: '700',
            fontSize: '18px',
            color: '#4f46e5',
        }}
        >
        {level}
        </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>
                {name}
            </span>
        </div>
    </div>
    );
}

export default StatusBar;
