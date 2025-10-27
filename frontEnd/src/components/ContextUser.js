import React, { createContext, useContext, useEffect, useState } from 'react';
import initialUser from './user';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [buildings, setBuildings] = useState([]); // 🏠 store all player buildings

  const deductMoney = (amount) => {
    setUser((prevUser) => ({
      ...prevUser,
      money: Math.max(prevUser.money - amount, 0),
    }));
  };

  const addMoney = (amount) => {
    setUser((prevUser) => ({
      ...prevUser,
      money: prevUser.money + amount,
    }));
  };

  // 🏗 Add a new building
  const addBuilding = (building) => {
    setBuildings((prev) => [...prev, building]);
  };

  // 💣 Remove a building (e.g. when selling)
  const removeBuilding = (id) => {
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  // 💰 Give money every 5 seconds for each building
  useEffect(() => {
    const interval = setInterval(() => {
      if (buildings.length === 0) return; // no buildings → no income

      const totalIncome = buildings.reduce((sum, b) => sum + b.income, 0);
      addMoney(totalIncome);
    }, 5000);

    return () => clearInterval(interval);
  }, [buildings]);

  const value = {
    user,
    buildings,
    addBuilding,
    removeBuilding,
    deductMoney,
    addMoney,
    setBuildings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
