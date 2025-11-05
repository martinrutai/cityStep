import React from 'react';
import { useUser } from './ContextUser';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const { user } = useUser();
    const navigate = useNavigate();
    if (!user) return null;
    const { money = 0, level = 0, name = 'Player' } = user;

    return (
        <div style={{ overflow: 'hidden', fontFamily: 'system-ui, sans-serif', fontWeight: '700',fontSize: '1.2rem', backgroundColor: '#2b2b2b', color: 'white', height: '100vh' }}>
            <button onClick={() => navigate(-1)} style={{color: 'white', cursor: 'pointer' , width: '20vw', height: '7vw', fontSize: '1rem', margin: '5vw', marginBottom: '0vw', backgroundColor: '#4f46e5', border: 'none',  borderRadius: '8px'}}>&larr; Back</button>
            <div style={{margin: '5vw', marginTop: '0vw'}}>
                <h1>{name}'s</h1>
            <h1>Profile</h1>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{padding: '2vw', margin:'2vw', textAlign: 'left', fontSize: '1.5rem',
                    borderRadius: '8px', backgroundColor: '#212121ff'
                }}>
                    <div style={{padding: '1vw'}}>Money</div>
                    <div style={{padding: '1vw', color: '#49b82aff'}}>${money.toLocaleString()}</div>
                </div>
                <div style={{padding: '2vw', margin:'2vw', textAlign: 'left', fontSize: '1.5rem',
                    borderRadius: '8px', backgroundColor: '#212121ff'
                }}>
                    <div style={{padding: '1vw'}}>Level</div>
                    <div style={{padding: '1vw', color: '#4f46e5'}}>{level}</div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
