import React, { createContext, useContext, useState } from 'react';
import initialUser from './user';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(initialUser);

    const deductMoney = (amount) => {
    setUser(prevUser => ({
        ...prevUser,
        money: prevUser.money - amount
    }));
};

const value = {
    user,
    deductMoney
};

return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
return useContext(UserContext);
}