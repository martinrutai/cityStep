import React, {useState} from 'react';
import { useUser } from './ContextUser';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { login, user } = useUser();
    const [name, setName] = useState('');
    React.useEffect(() => {
        const handleResize = () => {
            setButtonSize({
                width: window.innerWidth >= 600 ? '15vw' : '25vw',
                height: window.innerWidth >= 600 ? '4vw' : '7vw',
                fontSize: window.innerWidth >= 600 ? '0.9rem' : '1rem'
            });
        };
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const [buttonSize, setButtonSize] = React.useState({
        width: window.innerWidth >= 600 ? '15vw' : '25vw',
        height: window.innerWidth >= 600 ? '4vw' : '3vw',
        fontSize: window.innerWidth >= 600 ? '0.9rem' : '1rem'
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        login(name);
        console.log("submit" + user.money + user.name)
    };
    
    if (!user) return null;

    return (
        <div style={{ overflow: 'hidden', fontFamily: 'system-ui, sans-serif', fontWeight: '700',fontSize: '1.2rem', backgroundColor: '#2b2b2b', color: 'white', height: '100vh' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{
                    color: 'white', 
                    cursor: 'pointer',
                    width: buttonSize.width,
                    height: buttonSize.height,
                    fontSize: buttonSize.fontSize,
                    margin: '5vw',
                    marginBottom: '0vw',
                    backgroundColor: '#4f46e5',
                    border: 'none',
                    borderRadius: '8px'
                }}
            >&larr; Back</button>
            <div style={{margin: '5vw', marginTop: '0vw'}}>
                <h1>{name}'s</h1>
            <h1>Profile</h1>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{padding: '2vw', margin:'2vw', textAlign: 'left', fontSize: '1.5rem',
                    borderRadius: '8px', backgroundColor: '#212121ff'
                }}>
                    <div style={{padding: '1vw'}}>Money</div>
                    <div style={{padding: '1vw', color: '#49b82aff'}}>${user.money.toLocaleString()}</div>
                </div>
                <div style={{padding: '2vw', margin:'2vw', textAlign: 'left', fontSize: '1.5rem',
                    borderRadius: '8px', backgroundColor: '#212121ff'
                }}>
                    <div style={{padding: '1vw'}}>Level</div>
                    <div style={{padding: '1vw', color: '#4f46e5'}}>{user.level}</div>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Profile;
