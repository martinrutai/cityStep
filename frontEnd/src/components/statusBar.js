import React from 'react';
import { useUser } from './ContextUser';
import { Link } from 'react-router-dom';

function StatusBar() {
  const { user } = useUser();
const { money, level, name } = user;

return (
    <div
    style={{
        display: 'flex',
        maxHeight: '34px',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#212121ff',
        borderRadius: '12px',
        width: '95%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, sans-serif',
        padding: '2% 2%',
        zIndex: 1000,
    }}
    >
    <div style={{ display: 'flex', alignItems: 'center', width: "40%" }}>
        <span style={{ fontWeight: '600', fontSize: '16px', color: '#49b82aff' }}>
            ${money.toLocaleString()}
        </span>
    </div>

    <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '14px', color: 'white' }}>Level</span>
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

        <div style={{ display: 'flex', justifyContent: 'right', width: "40%"}}>
            <Link to="/profile" style={{ width: '33%', textDecoration: 'none' }}>
                <div style={{ width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-block' }}>
                    <img
                        style={{ width: '70%', maxWidth: '50px', objectFit: 'cover'}}
                        src='https://cdn-icons-png.flaticon.com/512/9815/9815472.png'
                        alt='pfp'
                    />
                </div>
            </Link>
        </div>
    </div>
    );
}

export default StatusBar;
